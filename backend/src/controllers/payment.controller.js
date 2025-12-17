/**
 * Payment Controller
 * CLB Bóng Bàn Lê Quý Đôn
 */

const PaymentModel = require('../models/payment.model');
const logger = require('../utils/logger');

const PaymentController = {
    /**
     * GET /api/payments
     * Get all payments with filters
     */
    async getAll(req, res) {
        try {
            const { member_id, payment_type, from_date, to_date, limit, offset } = req.query;

            const payments = await PaymentModel.findAll({
                member_id,
                payment_type,
                from_date,
                to_date,
                limit: parseInt(limit) || 50,
                offset: parseInt(offset) || 0
            });

            res.json({
                success: true,
                data: payments
            });
        } catch (error) {
            logger.error('Get payments error:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể tải lịch sử thanh toán'
            });
        }
    },

    /**
     * GET /api/payments/:id
     * Get single payment
     */
    async getById(req, res) {
        try {
            const { id } = req.params;
            const payment = await PaymentModel.findById(id);

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy giao dịch'
                });
            }

            res.json({
                success: true,
                data: payment
            });
        } catch (error) {
            logger.error('Get payment by ID error:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể tải thông tin giao dịch'
            });
        }
    },

    /**
     * POST /api/payments
     * Create new payment
     */
    async create(req, res) {
        try {
            const {
                member_id,
                amount,
                payment_type,
                payment_method,
                description,
                notes,
                receipt_number,
                paid_at
            } = req.body;

            const payment = await PaymentModel.create({
                member_id,
                amount,
                payment_type,
                payment_method,
                description,
                notes,
                receipt_number,
                paid_at,
                recorded_by: req.user?.id
            });

            logger.info(`Payment created: ${payment.id} - ${amount}đ (${payment_type})`);

            res.status(201).json({
                success: true,
                message: 'Ghi nhận thanh toán thành công',
                data: payment
            });
        } catch (error) {
            logger.error('Create payment error:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể ghi nhận thanh toán'
            });
        }
    },

    /**
     * GET /api/payments/stats
     * Get payment statistics
     */
    async getStatistics(req, res) {
        try {
            const { from_date, to_date } = req.query;
            const stats = await PaymentModel.getStatistics({ from_date, to_date });

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            logger.error('Get payment stats error:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể tải thống kê'
            });
        }
    },

    /**
     * DELETE /api/payments/:id
     * Delete payment
     */
    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await PaymentModel.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy giao dịch'
                });
            }

            logger.info(`Payment deleted: ${id}`);

            res.json({
                success: true,
                message: 'Xóa giao dịch thành công'
            });
        } catch (error) {
            logger.error('Delete payment error:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể xóa giao dịch'
            });
        }
    }
};

module.exports = PaymentController;
