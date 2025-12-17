/**
 * Order Model
 * CLB Bóng Bàn Lê Quý Đôn
 */

const { query } = require('../config/database');

const OrderModel = {
    /**
     * Get all orders with optional filters
     */
    async findAll({ status, limit = 50, offset = 0 } = {}) {
        let sql = `
            SELECT *
            FROM orders
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (status) {
            sql += ` AND status = $${paramIndex++}`;
            params.push(status);
        }

        sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
        params.push(limit, offset);

        const result = await query(sql, params);
        return result.rows;
    },

    /**
     * Get order by ID
     */
    async findById(id) {
        const sql = 'SELECT * FROM orders WHERE id = $1';
        const result = await query(sql, [id]);
        return result.rows[0];
    },

    /**
     * Create new order
     */
    async create(data) {
        const sql = `
            INSERT INTO orders (
                customer_name, customer_phone, 
                product_name, product_price, quantity,
                notes
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const params = [
            data.customer_name,
            data.customer_phone,
            data.product_name,
            data.product_price,
            data.quantity || 1,
            data.notes || null
        ];
        const result = await query(sql, params);
        return result.rows[0];
    },

    /**
     * Update order status
     */
    async updateStatus(id, status) {
        const sql = `
            UPDATE orders 
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        const result = await query(sql, [status, id]);
        return result.rows[0];
    },

    /**
     * Count total orders
     */
    async count({ status } = {}) {
        let sql = 'SELECT COUNT(*) as total FROM orders WHERE 1=1';
        const params = [];

        if (status) {
            sql += ' AND status = $1';
            params.push(status);
        }

        const result = await query(sql, params);
        return parseInt(result.rows[0].total);
    }
};

module.exports = OrderModel;
