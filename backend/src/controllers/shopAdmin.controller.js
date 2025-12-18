/**
 * Shop Admin Controller - Protected APIs
 * CLB Bóng Bàn Lê Quý Đôn
 */

const ShopProductModel = require('../models/shopProduct.model');
const ShopOrderModel = require('../models/shopOrder.model');
const logger = require('../utils/logger');

const ShopAdminController = {
    // ============================================
    // DASHBOARD
    // ============================================

    /**
     * GET /api/shop/admin/stats
     * Get dashboard statistics
     */
    async getStats(req, res) {
        try {
            const orderStats = await ShopOrderModel.getStats();
            const productCount = await ShopProductModel.count({ is_active: true });

            res.json({
                success: true,
                data: {
                    ...orderStats,
                    active_products: productCount
                }
            });
        } catch (error) {
            logger.error('Error getting shop stats:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi khi tải thống kê'
            });
        }
    },

    // ============================================
    // ORDERS MANAGEMENT
    // ============================================

    /**
     * GET /api/shop/admin/orders
     * Get all orders
     */
    async getOrders(req, res) {
        try {
            const { payment_status, order_status, search, limit = 50, offset = 0 } = req.query;

            const orders = await ShopOrderModel.findAll({
                payment_status,
                order_status,
                search,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            const total = await ShopOrderModel.count({ payment_status, order_status });

            res.json({
                success: true,
                data: orders,
                pagination: {
                    total,
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            });
        } catch (error) {
            logger.error('Error getting orders:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi khi tải danh sách đơn hàng'
            });
        }
    },

    /**
     * GET /api/shop/admin/orders/:id
     * Get order detail
     */
    async getOrderById(req, res) {
        try {
            const { id } = req.params;
            const order = await ShopOrderModel.findById(id);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy đơn hàng'
                });
            }

            res.json({
                success: true,
                data: order
            });
        } catch (error) {
            logger.error('Error getting order:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi khi tải chi tiết đơn hàng'
            });
        }
    },

    /**
     * PUT /api/shop/admin/orders/:id/status
     * Update order status
     */
    async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { order_status } = req.body;

            const validStatuses = ['new', 'processing', 'done', 'cancelled'];
            if (!validStatuses.includes(order_status)) {
                return res.status(400).json({
                    success: false,
                    error: 'Trạng thái không hợp lệ'
                });
            }

            const order = await ShopOrderModel.updateOrderStatus(id, order_status);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy đơn hàng'
                });
            }

            logger.info(`Order ${order.order_code} status updated to ${order_status} by ${req.user.username}`);

            res.json({
                success: true,
                message: 'Cập nhật trạng thái thành công',
                data: order
            });
        } catch (error) {
            logger.error('Error updating order status:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi khi cập nhật trạng thái'
            });
        }
    },

    /**
     * PUT /api/shop/admin/orders/:id/confirm
     * Confirm payment received
     */
    async confirmPayment(req, res) {
        try {
            const { id } = req.params;
            const { note } = req.body;
            const adminId = req.user.id;

            const order = await ShopOrderModel.updatePaymentStatus(id, 'confirmed', adminId);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy đơn hàng'
                });
            }

            // Update admin note if provided
            if (note) {
                await ShopOrderModel.updateAdminNote(id, note);
            }

            logger.info(`Payment for order ${order.order_code} confirmed by ${req.user.username}`);

            res.json({
                success: true,
                message: 'Đã xác nhận thanh toán',
                data: order
            });
        } catch (error) {
            logger.error('Error confirming payment:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi khi xác nhận thanh toán'
            });
        }
    },

    /**
     * PUT /api/shop/admin/orders/:id/note
     * Update admin note
     */
    async updateOrderNote(req, res) {
        try {
            const { id } = req.params;
            const { note } = req.body;

            const order = await ShopOrderModel.updateAdminNote(id, note);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy đơn hàng'
                });
            }

            res.json({
                success: true,
                message: 'Đã cập nhật ghi chú',
                data: order
            });
        } catch (error) {
            logger.error('Error updating order note:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi khi cập nhật ghi chú'
            });
        }
    },

    // ============================================
    // PRODUCTS MANAGEMENT
    // ============================================

    /**
     * GET /api/shop/admin/products
     * Get all products (including inactive)
     */
    async getProducts(req, res) {
        try {
            const { category, brand, is_active, limit = 100, offset = 0 } = req.query;

            const products = await ShopProductModel.findAllAdmin({
                category,
                brand,
                is_active: is_active === undefined ? undefined : is_active === 'true',
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            const total = await ShopProductModel.count({ category });

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
     * GET /api/shop/admin/products/:id
     * Get product by ID
     */
    async getProductById(req, res) {
        try {
            const { id } = req.params;
            const product = await ShopProductModel.findById(id);

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
            logger.error('Error getting product:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi khi tải sản phẩm'
            });
        }
    },

    /**
     * POST /api/shop/admin/products
     * Create new product
     */
    async createProduct(req, res) {
        try {
            const productData = req.body;

            // Validate required fields
            if (!productData.name || !productData.category || !productData.price) {
                return res.status(400).json({
                    success: false,
                    error: 'Vui lòng điền tên, danh mục và giá sản phẩm'
                });
            }

            const product = await ShopProductModel.create(productData);

            logger.info(`Product created: ${product.name} by ${req.user.username}`);

            res.status(201).json({
                success: true,
                message: 'Thêm sản phẩm thành công',
                data: product
            });
        } catch (error) {
            logger.error('Error creating product:', error);

            if (error.code === '23505') { // Unique violation
                return res.status(400).json({
                    success: false,
                    error: 'Slug sản phẩm đã tồn tại'
                });
            }

            res.status(500).json({
                success: false,
                error: 'Lỗi khi thêm sản phẩm'
            });
        }
    },

    /**
     * PUT /api/shop/admin/products/:id
     * Update product
     */
    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const product = await ShopProductModel.update(id, updateData);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy sản phẩm'
                });
            }

            logger.info(`Product updated: ${product.name} by ${req.user.username}`);

            res.json({
                success: true,
                message: 'Cập nhật sản phẩm thành công',
                data: product
            });
        } catch (error) {
            logger.error('Error updating product:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi khi cập nhật sản phẩm'
            });
        }
    },

    /**
     * DELETE /api/shop/admin/products/:id
     * Soft delete product
     */
    async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            const { hard } = req.query;

            let product;
            if (hard === 'true') {
                product = await ShopProductModel.hardDelete(id);
            } else {
                product = await ShopProductModel.delete(id);
            }

            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy sản phẩm'
                });
            }

            logger.info(`Product ${hard === 'true' ? 'deleted' : 'hidden'}: ${product.name} by ${req.user.username}`);

            res.json({
                success: true,
                message: hard === 'true' ? 'Đã xóa sản phẩm' : 'Đã ẩn sản phẩm',
                data: product
            });
        } catch (error) {
            logger.error('Error deleting product:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi khi xóa sản phẩm'
            });
        }
    },

    /**
     * PUT /api/shop/admin/products/:id/stock
     * Update product stock
     */
    async updateStock(req, res) {
        try {
            const { id } = req.params;
            const { quantity } = req.body;

            if (quantity === undefined || isNaN(quantity)) {
                return res.status(400).json({
                    success: false,
                    error: 'Số lượng không hợp lệ'
                });
            }

            const product = await ShopProductModel.updateStock(id, quantity);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy sản phẩm'
                });
            }

            logger.info(`Stock updated for ${product.name}: ${quantity > 0 ? '+' : ''}${quantity} by ${req.user.username}`);

            res.json({
                success: true,
                message: 'Cập nhật tồn kho thành công',
                data: product
            });
        } catch (error) {
            logger.error('Error updating stock:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi khi cập nhật tồn kho'
            });
        }
    }
};

module.exports = ShopAdminController;
