/**
 * Order Controller
 * CLB Bóng Bàn Lê Quý Đôn
 */

const OrderModel = require('../models/order.model');
const SystemLogModel = require('../models/systemLog.model');
const logger = require('../utils/logger');

const OrderController = {
    /**
     * GET /api/orders
     * Get all orders (Admin only)
     */
    async getAll(req, res) {
        try {
            const { status, limit, offset } = req.query;

            const orders = await OrderModel.findAll({
                status,
                limit: parseInt(limit) || 50,
                offset: parseInt(offset) || 0
            });

            const total = await OrderModel.count({ status });

            res.json({
                success: true,
                data: orders,
                pagination: {
                    total,
                    limit: parseInt(limit) || 50,
                    offset: parseInt(offset) || 0
                }
            });
        } catch (error) {
            logger.error('Get orders error:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể tải danh sách đơn hàng'
            });
        }
    },

    /**
     * POST /api/orders
     * Create new order (Public)
     */

    async create(req, res) {
        try {
            const { customer_name, customer_phone, product_name, product_price, quantity, notes } = req.body;

            const order = await OrderModel.create({
                customer_name,
                customer_phone,
                product_name,
                product_price,
                quantity,
                notes
            });

            // Log activity
            await SystemLogModel.create({
                action_type: 'ORDER_NEW',
                description: `Đơn hàng mới: ${product_name} - ${customer_name}`
            });

            logger.info(`New order created: ${order.product_name} by ${order.customer_name}`);

            res.status(201).json({
                success: true,
                message: 'Đặt hàng thành công! CLB sẽ liên hệ sớm nhất.',
                data: order
            });
        } catch (error) {
            logger.error('Create order error:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể tạo đơn hàng'
            });
        }
    },

    /**
     * PUT /api/orders/:id/status
     * Update order status (Admin only)
     */
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const order = await OrderModel.updateStatus(id, status);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy đơn hàng'
                });
            }

            // Log activity
            let statusText = status;
            if (status === 'completed') statusText = 'Hoàn thành';
            if (status === 'cancelled') statusText = 'Đã hủy';

            await SystemLogModel.create({
                action_type: 'ORDER_UPDATE',
                description: `Cập nhật đơn hàng ${order.product_name} - ${statusText}`
            });

            res.json({
                success: true,
                message: 'Cập nhật trạng thái thành công',
                data: order
            });
        } catch (error) {
            logger.error('Update order status error:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể cập nhật trạng thái'
            });
        }
    }
};

module.exports = OrderController;
