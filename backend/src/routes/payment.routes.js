/**
 * Payment Routes
 * CLB Bóng Bàn Lê Quý Đôn
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const PaymentController = require('../controllers/payment.controller');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware');
const { handleValidation } = require('../middlewares/validation.middleware');

// All payment routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/payments/stats
 * Get payment statistics
 */
router.get('/stats', PaymentController.getStatistics);

/**
 * GET /api/payments
 * Get all payments
 */
router.get('/', [
    query('member_id').optional().isUUID().withMessage('Member ID không hợp lệ'),
    query('payment_type').optional().isIn(['per_visit', 'monthly', 'coach_fee', 'other']).withMessage('Loại thanh toán không hợp lệ'),
    handleValidation
], PaymentController.getAll);

/**
 * GET /api/payments/:id
 * Get payment by ID
 */
router.get('/:id', [
    param('id').isUUID().withMessage('ID không hợp lệ'),
    handleValidation
], PaymentController.getById);

/**
 * POST /api/payments
 * Create new payment
 */
router.post('/', [
    body('member_id')
        .notEmpty().withMessage('Vui lòng chọn học viên')
        .isUUID().withMessage('Member ID không hợp lệ'),
    body('amount')
        .notEmpty().withMessage('Vui lòng nhập số tiền')
        .isInt({ min: 1000 }).withMessage('Số tiền phải >= 1.000đ'),
    body('payment_type')
        .notEmpty().withMessage('Vui lòng chọn loại thanh toán')
        .isIn(['per_visit', 'monthly', 'coach_fee', 'other']).withMessage('Loại thanh toán không hợp lệ'),
    body('payment_method')
        .optional()
        .isIn(['cash', 'bank_transfer', 'momo', 'zalo_pay']).withMessage('Phương thức thanh toán không hợp lệ'),
    handleValidation
], PaymentController.create);

/**
 * DELETE /api/payments/:id
 * Delete payment
 */
router.delete('/:id', [
    param('id').isUUID().withMessage('ID không hợp lệ'),
    handleValidation
], PaymentController.delete);

module.exports = router;
