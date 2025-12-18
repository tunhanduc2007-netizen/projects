/**
 * Shop Order Model
 * CLB Bóng Bàn Lê Quý Đôn
 */

const { query, getClient } = require('../config/database');

const ShopOrderModel = {
    /**
     * Generate unique order code
     * Format: YYYYMMDD + 4 random alphanumeric
     */
    generateOrderCode() {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${dateStr}${randomChars}`;
    },

    /**
     * Generate transfer content for bank transfer
     */
    generateTransferContent(orderCode) {
        return `CLBLQD_${orderCode}`;
    },

    /**
     * Generate VietQR URL
     * Bank: ACB | STK: 6200167 | CTK: TU NHAN LUAN
     */
    generateVietQRUrl(bankInfo, amount, transferContent) {
        const accountName = encodeURIComponent(bankInfo.account_holder);
        const addInfo = encodeURIComponent(transferContent);
        return `https://img.vietqr.io/image/${bankInfo.bank_code}-${bankInfo.account_number}-compact2.png?amount=${amount}&addInfo=${addInfo}&accountName=${accountName}`;
    },

    /**
     * Get primary bank account
     */
    async getPrimaryBankAccount() {
        const sql = `
            SELECT * FROM shop_bank_accounts
            WHERE is_primary = true AND is_active = true
            LIMIT 1
        `;
        const result = await query(sql);
        return result.rows[0];
    },

    /**
     * Create new order with items (transaction)
     * Now supports: address, shipping fee, COD
     */
    async create(orderData, items) {
        const client = await getClient();
        const { calculateShippingFee, isCodAvailable } = require('../utils/shipping');

        try {
            await client.query('BEGIN');

            // Get bank account (needed for QR even if COD)
            const bankResult = await client.query(`
                SELECT * FROM shop_bank_accounts
                WHERE is_primary = true AND is_active = true
                LIMIT 1
            `);
            const bankAccount = bankResult.rows[0];

            if (!bankAccount) {
                throw new Error('Không tìm thấy tài khoản ngân hàng');
            }

            // Generate order code
            const orderCode = this.generateOrderCode();
            const transferContent = this.generateTransferContent(orderCode);

            // Calculate total product amount
            const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // Calculate shipping fee (backend logic only)
            const shippingResult = calculateShippingFee(
                totalAmount,
                orderData.address_district,
                orderData.address_city || 'TP. Hồ Chí Minh'
            );
            const shippingFee = shippingResult.shippingFee;
            const finalAmount = totalAmount + shippingFee;

            // Check COD availability - fallback to QR if not available
            let isCod = orderData.payment_method === 'cod';
            if (isCod && !isCodAvailable(orderData.address_district, orderData.address_city)) {
                // COD not available at this address - fallback to QR
                isCod = false;
                console.log('[Order] COD not available, falling back to QR payment');
            }

            // Generate QR URL (for both COD backup and transfer)
            const qrCodeUrl = this.generateVietQRUrl(bankAccount, finalAmount, transferContent);

            // Determine payment status
            const paymentStatus = isCod ? 'unpaid' : 'pending';
            const paymentMethod = isCod ? 'cod' : (orderData.payment_method === 'cod' ? 'qr' : (orderData.payment_method || 'qr'));

            // Insert order with new fields
            const orderSql = `
                INSERT INTO shop_orders (
                    order_code, customer_name, customer_phone, customer_note,
                    address_street, address_ward, address_district, address_city,
                    total_amount, shipping_fee, final_amount,
                    payment_method, payment_status, is_cod,
                    transfer_content, qr_code_url
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                RETURNING *
            `;
            const orderParams = [
                orderCode,
                orderData.customer_name,
                orderData.customer_phone,
                orderData.customer_note || null,
                orderData.address_street || null,
                orderData.address_ward || null,
                orderData.address_district || null,
                orderData.address_city || 'TP. Hồ Chí Minh',
                totalAmount,
                shippingFee,
                finalAmount,
                paymentMethod,
                paymentStatus,
                isCod,
                transferContent,
                qrCodeUrl
            ];
            const orderResult = await client.query(orderSql, orderParams);
            const order = orderResult.rows[0];

            // Insert order items
            const insertedItems = [];
            for (const item of items) {
                const itemSql = `
                    INSERT INTO shop_order_items (
                        order_id, product_id, product_name, product_brand,
                        product_price, product_image, quantity, subtotal
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING *
                `;
                const itemParams = [
                    order.id,
                    item.product_id || null,
                    item.product_name,
                    item.product_brand || null,
                    item.price,
                    item.product_image || null,
                    item.quantity,
                    item.price * item.quantity
                ];
                const itemResult = await client.query(itemSql, itemParams);
                insertedItems.push(itemResult.rows[0]);
            }

            // Insert payment record (skip if COD - will create when payment received)
            if (!isCod) {
                const paymentSql = `
                    INSERT INTO shop_payments (
                        order_id, bank_name, bank_code, account_number,
                        account_holder, amount, transfer_content
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING *
                `;
                const paymentParams = [
                    order.id,
                    bankAccount.bank_name,
                    bankAccount.bank_code,
                    bankAccount.account_number,
                    bankAccount.account_holder,
                    finalAmount,
                    transferContent
                ];
                await client.query(paymentSql, paymentParams);
            }

            await client.query('COMMIT');

            return {
                ...order,
                items: insertedItems,
                bank: bankAccount,
                shipping: shippingResult
            };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    /**
     * Get order by order code (public - for customers)
     * Requires phone number for verification
     */
    async findByCodeAndPhone(orderCode, phone) {
        // Strip prefix if present (user might paste transfer content)
        const cleanCode = orderCode.replace(/^CLBLQD_/i, '').toUpperCase();

        const sql = `
            SELECT 
                o.*,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', oi.id,
                            'product_name', oi.product_name,
                            'product_brand', oi.product_brand,
                            'product_price', oi.product_price,
                            'product_image', oi.product_image,
                            'quantity', oi.quantity,
                            'subtotal', oi.subtotal
                        )
                    ) FILTER (WHERE oi.id IS NOT NULL),
                    '[]'
                ) as items
            FROM shop_orders o
            LEFT JOIN shop_order_items oi ON o.id = oi.order_id
            WHERE o.order_code = $1 AND o.customer_phone = $2
            GROUP BY o.id
        `;
        const result = await query(sql, [cleanCode, phone]);
        return result.rows[0];
    },

    /**
     * Get order by ID (admin)
     */
    async findById(id) {
        const sql = `
            SELECT 
                o.*,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', oi.id,
                            'product_name', oi.product_name,
                            'product_brand', oi.product_brand,
                            'product_price', oi.product_price,
                            'product_image', oi.product_image,
                            'quantity', oi.quantity,
                            'subtotal', oi.subtotal
                        )
                    ) FILTER (WHERE oi.id IS NOT NULL),
                    '[]'
                ) as items,
                (
                    SELECT json_build_object(
                        'bank_name', p.bank_name,
                        'bank_code', p.bank_code,
                        'account_number', p.account_number,
                        'account_holder', p.account_holder,
                        'status', p.status
                    )
                    FROM shop_payments p
                    WHERE p.order_id = o.id
                    LIMIT 1
                ) as payment
            FROM shop_orders o
            LEFT JOIN shop_order_items oi ON o.id = oi.order_id
            WHERE o.id = $1
            GROUP BY o.id
        `;
        const result = await query(sql, [id]);
        return result.rows[0];
    },

    /**
     * Get order by order code (admin - no phone required)
     */
    async findByCode(orderCode) {
        const sql = `
            SELECT 
                o.*,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', oi.id,
                            'product_name', oi.product_name,
                            'product_brand', oi.product_brand,
                            'product_price', oi.product_price,
                            'product_image', oi.product_image,
                            'quantity', oi.quantity,
                            'subtotal', oi.subtotal
                        )
                    ) FILTER (WHERE oi.id IS NOT NULL),
                    '[]'
                ) as items
            FROM shop_orders o
            LEFT JOIN shop_order_items oi ON o.id = oi.order_id
            WHERE o.order_code = $1
            GROUP BY o.id
        `;
        const result = await query(sql, [orderCode]);
        return result.rows[0];
    },

    /**
     * Get all orders (admin)
     */
    async findAll({ payment_status, order_status, limit = 50, offset = 0, search } = {}) {
        let sql = `
            SELECT 
                o.*,
                (SELECT COUNT(*) FROM shop_order_items WHERE order_id = o.id) as item_count
            FROM shop_orders o
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (payment_status) {
            sql += ` AND o.payment_status = $${paramIndex++}`;
            params.push(payment_status);
        }

        if (order_status) {
            sql += ` AND o.order_status = $${paramIndex++}`;
            params.push(order_status);
        }

        if (search) {
            sql += ` AND (o.order_code ILIKE $${paramIndex} OR o.customer_name ILIKE $${paramIndex} OR o.customer_phone ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        sql += ` ORDER BY o.created_at DESC`;
        sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
        params.push(limit, offset);

        const result = await query(sql, params);
        return result.rows;
    },

    /**
     * Update order status
     */
    async updateOrderStatus(id, status) {
        const sql = `
            UPDATE shop_orders
            SET order_status = $1
            WHERE id = $2
            RETURNING *
        `;
        const result = await query(sql, [status, id]);
        return result.rows[0];
    },

    /**
     * Update payment status
     */
    async updatePaymentStatus(id, status, adminId = null) {
        const sql = `
            UPDATE shop_orders
            SET 
                payment_status = $1,
                confirmed_by = $2,
                confirmed_at = CASE WHEN $1 = 'confirmed' THEN CURRENT_TIMESTAMP ELSE confirmed_at END
            WHERE id = $3
            RETURNING *
        `;
        const result = await query(sql, [status, adminId, id]);

        // Also update payment record
        if (status === 'confirmed') {
            await query(`
                UPDATE shop_payments
                SET status = 'verified', verified_by = $1, verified_at = CURRENT_TIMESTAMP
                WHERE order_id = $2
            `, [adminId, id]);
        }

        return result.rows[0];
    },

    /**
     * Update admin note
     */
    async updateAdminNote(id, note) {
        const sql = `
            UPDATE shop_orders
            SET admin_note = $1
            WHERE id = $2
            RETURNING *
        `;
        const result = await query(sql, [note, id]);
        return result.rows[0];
    },

    /**
     * Get order statistics
     */
    async getStats() {
        const sql = `
            SELECT 
                COUNT(*) as total_orders,
                COUNT(*) FILTER (WHERE payment_status = 'pending') as pending_orders,
                COUNT(*) FILTER (WHERE payment_status = 'paid') as paid_orders,
                COUNT(*) FILTER (WHERE payment_status = 'confirmed') as confirmed_orders,
                COUNT(*) FILTER (WHERE order_status = 'new') as new_orders,
                COUNT(*) FILTER (WHERE order_status = 'processing') as processing_orders,
                COUNT(*) FILTER (WHERE order_status = 'done') as done_orders,
                COUNT(*) FILTER (WHERE order_status = 'cancelled') as cancelled_orders,
                COALESCE(SUM(total_amount), 0) as total_revenue,
                COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'confirmed'), 0) as confirmed_revenue,
                COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as today_orders,
                COALESCE(SUM(total_amount) FILTER (WHERE DATE(created_at) = CURRENT_DATE AND payment_status = 'confirmed'), 0) as today_revenue
            FROM shop_orders
            WHERE order_status != 'cancelled'
        `;
        const result = await query(sql);
        const stats = result.rows[0];

        // Convert string numbers to integers
        return {
            total_orders: parseInt(stats.total_orders) || 0,
            pending_orders: parseInt(stats.pending_orders) || 0,
            paid_orders: parseInt(stats.paid_orders) || 0,
            confirmed_orders: parseInt(stats.confirmed_orders) || 0,
            new_orders: parseInt(stats.new_orders) || 0,
            processing_orders: parseInt(stats.processing_orders) || 0,
            done_orders: parseInt(stats.done_orders) || 0,
            cancelled_orders: parseInt(stats.cancelled_orders) || 0,
            total_revenue: parseInt(stats.total_revenue) || 0,
            confirmed_revenue: parseInt(stats.confirmed_revenue) || 0,
            today_orders: parseInt(stats.today_orders) || 0,
            today_revenue: parseInt(stats.today_revenue) || 0
        };
    },

    /**
     * Get count with filters
     */
    async count({ payment_status, order_status } = {}) {
        let sql = 'SELECT COUNT(*) as total FROM shop_orders WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (payment_status) {
            sql += ` AND payment_status = $${paramIndex++}`;
            params.push(payment_status);
        }

        if (order_status) {
            sql += ` AND order_status = $${paramIndex++}`;
            params.push(order_status);
        }

        const result = await query(sql, params);
        return parseInt(result.rows[0].total);
    }
};

module.exports = ShopOrderModel;
