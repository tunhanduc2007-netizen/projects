/**
 * Shop Controller - Public APIs
 * CLB Bóng Bàn Lê Quý Đôn
 */

const ShopProductModel = require('../models/shopProduct.model');
const ShopOrderModel = require('../models/shopOrder.model');
const logger = require('../utils/logger');

const ShopController = {
    // ============================================
    // PRODUCTS - PUBLIC
    // ============================================

    /**
     * GET /api/shop/products
     * Get all active products
     */
    async getProducts(req, res) {
        try {
            const { category, brand, recommended, limit = 50, offset = 0 } = req.query;

            const products = await ShopProductModel.findAll({
                category,
                brand,
                recommended: recommended === 'true',
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            const total = await ShopProductModel.count({ category, is_active: true });

            res.json({
                success: true,
                data: products,
                pagination: {
                    total,
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            });
        } catch (error) {
            logger.error('Error getting products:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi khi tải danh sách sản phẩm'
            });
        }
    },

    /**
     * GET /api/shop/products/:slug
     * Get product by slug
     */
    async getProductBySlug(req, res) {
        try {
            const { slug } = req.params;
            const product = await ShopProductModel.findBySlug(slug);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy sản phẩm'
                });
            }

            res.json({
                success: true,
                data: product
            });
        } catch (error) {
            logger.error('Error getting product by slug:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi khi tải thông tin sản phẩm'
            });
        }
    },

    /**
     * GET /api/shop/categories
     * Get all categories with product count
     */
    async getCategories(req, res) {
        try {
            const categories = await ShopProductModel.getCategories();
            res.json({
                success: true,
                data: categories
            });
        } catch (error) {
            logger.error('Error getting categories:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi khi tải danh mục'
            });
        }
    },

    /**
     * GET /api/shop/brands
     * Get all brands with product count
     */
    async getBrands(req, res) {
        try {
            const brands = await ShopProductModel.getBrands();
            res.json({
                success: true,
                data: brands
            });
        } catch (error) {
            logger.error('Error getting brands:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi khi tải thương hiệu'
            });
        }
    },

    // ============================================
    // ORDERS - PUBLIC
    // ============================================

    /**
     * POST /api/shop/orders
     * Create new order
     */
    async createOrder(req, res) {
        try {
            const { customer_name, customer_phone, customer_note, payment_method, items } = req.body;

            // Log incoming request
            logger.info('=== CREATE ORDER REQUEST ===');
            logger.info(`Customer: ${customer_name} | Phone: ${customer_phone}`);
            logger.info(`Items count: ${items?.length || 0}`);

            // Validate required fields
            if (!customer_name || !customer_phone || !items || items.length === 0) {
                logger.warn('Order validation failed: missing required fields');
                return res.status(400).json({
                    success: false,
                    error: 'Vui lòng điền đầy đủ thông tin'
                });
            }

            // Validate phone format (Vietnam)
            const phoneRegex = /^(0[1-9])[0-9]{8}$/;
            if (!phoneRegex.test(customer_phone.replace(/\s/g, ''))) {
                logger.warn('Order validation failed: invalid phone format');
                return res.status(400).json({
                    success: false,
                    error: 'Số điện thoại không hợp lệ'
                });
            }

            // Validate items
            for (const item of items) {
                if (!item.product_name || !item.price || !item.quantity) {
                    logger.warn('Order validation failed: invalid item data');
                    return res.status(400).json({
                        success: false,
                        error: 'Thông tin sản phẩm không hợp lệ'
                    });
                }
                if (item.quantity < 1) {
                    return res.status(400).json({
                        success: false,
                        error: 'Số lượng phải >= 1'
                    });
                }
            }

            // Create order (with transaction)
            logger.info('Calling ShopOrderModel.create()...');
            const order = await ShopOrderModel.create(
                {
                    customer_name: customer_name.trim(),
                    customer_phone: customer_phone.replace(/\s/g, ''),
                    customer_note: customer_note?.trim() || null,
                    payment_method: payment_method || 'qr'
                },
                items
            );

            // Verify order was created
            if (!order || !order.order_code) {
                logger.error('ORDER CREATION FAILED: No order_code returned');
                return res.status(500).json({
                    success: false,
                    error: 'Lỗi tạo đơn hàng - không có mã đơn'
                });
            }

            logger.info(`=== ORDER CREATED SUCCESSFULLY ===`);
            logger.info(`Order Code: ${order.order_code}`);
            logger.info(`Order ID: ${order.id}`);
            logger.info(`Total: ${order.total_amount}`);
            logger.info(`Items: ${order.items?.length || 0}`);

            res.status(201).json({
                success: true,
                message: 'Đặt hàng thành công!',
                data: {
                    order_code: order.order_code,
                    total_amount: order.total_amount,
                    transfer_content: order.transfer_content,
                    qr_code_url: order.qr_code_url,
                    bank: {
                        bank_name: order.bank.bank_name,
                        account_number: order.bank.account_number,
                        account_holder: order.bank.account_holder
                    },
                    items: order.items
                }
            });
        } catch (error) {
            logger.error('=== ORDER CREATION ERROR ===');
            logger.error(`Error: ${error.message}`);
            logger.error(`Stack: ${error.stack}`);
            res.status(500).json({
                success: false,
                error: 'Lỗi khi tạo đơn hàng. Vui lòng thử lại.'
            });
        }
    },

    /**
     * GET /api/shop/orders/lookup
     * Lookup order by code and phone
     */
    async lookupOrder(req, res) {
        try {
            const { code, phone } = req.query;

            if (!code || !phone) {
                return res.status(400).json({
                    success: false,
                    error: 'Vui lòng nhập mã đơn hàng và số điện thoại'
                });
            }

            const order = await ShopOrderModel.findByCodeAndPhone(
                code.toUpperCase(),
                phone.replace(/\s/g, '')
            );

            if (!order) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy đơn hàng hoặc số điện thoại không khớp'
                });
            }

            // Don't expose sensitive admin info
            const { admin_note, confirmed_by, ...safeOrder } = order;

            res.json({
                success: true,
                data: safeOrder
            });
        } catch (error) {
            logger.error('Error looking up order:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi khi tra cứu đơn hàng'
            });
        }
    },

    /**
     * GET /api/shop/bank-info
     * Get bank account info for transfer
     */
    async getBankInfo(req, res) {
        try {
            const bankAccount = await ShopOrderModel.getPrimaryBankAccount();

            if (!bankAccount) {
                return res.status(500).json({
                    success: false,
                    error: 'Chưa cấu hình tài khoản ngân hàng'
                });
            }

            res.json({
                success: true,
                data: {
                    bank_name: bankAccount.bank_name,
                    bank_code: bankAccount.bank_code,
                    account_number: bankAccount.account_number,
                    account_holder: bankAccount.account_holder
                }
            });
        } catch (error) {
            logger.error('Error getting bank info:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi khi tải thông tin ngân hàng'
            });
        }
    },

    /**
     * GET /api/shop/qr/:orderCode
     * Generate QR code URL for order
     */
    async getQRCode(req, res) {
        try {
            const { orderCode } = req.params;
            const { phone } = req.query;

            if (!phone) {
                return res.status(400).json({
                    success: false,
                    error: 'Vui lòng cung cấp số điện thoại để xác thực'
                });
            }

            const order = await ShopOrderModel.findByCodeAndPhone(orderCode, phone.replace(/\s/g, ''));

            if (!order) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy đơn hàng'
                });
            }

            res.json({
                success: true,
                data: {
                    qr_code_url: order.qr_code_url,
                    transfer_content: order.transfer_content,
                    amount: order.total_amount
                }
            });
        } catch (error) {
            logger.error('Error generating QR:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi khi tạo mã QR'
            });
        }
    }
};

module.exports = ShopController;
