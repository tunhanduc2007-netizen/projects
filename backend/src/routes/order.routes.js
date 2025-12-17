/**
 * Order Routes
 * CLB Bóng Bàn Lê Quý Đôn
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const OrderController = require('../controllers/order.controller');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware');
const { handleValidation } = require('../middlewares/validation.middleware');

// Public route: Create order
router.post('/', [
    body('customer_name').notEmpty().withMessage('Vui lòng nhập họ tên'),
    body('customer_phone').notEmpty().withMessage('Vui lòng nhập số điện thoại'),
    body('product_name').notEmpty().withMessage('Thiếu tên sản phẩm'),
    body('product_price').isNumeric().withMessage('Giá không hợp lệ'),
    handleValidation
], OrderController.create);

// Admin routes: View and manage orders
router.get('/', [
    authenticateToken,
    requireAdmin,
    query('status').optional().isIn(['new', 'pending', 'completed', 'cancelled']).withMessage('Trạng thái không hợp lệ'),
    handleValidation
], OrderController.getAll);

router.put('/:id/status', [
    authenticateToken,
    requireAdmin,
    param('id').isUUID().withMessage('ID không hợp lệ'),
    body('status').isIn(['new', 'pending', 'completed', 'cancelled']).withMessage('Trạng thái không hợp lệ'),
    handleValidation
], OrderController.updateStatus);

module.exports = router;
