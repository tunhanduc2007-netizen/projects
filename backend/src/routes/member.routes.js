/**
 * Member Routes
 * CLB Bóng Bàn Lê Quý Đôn
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const MemberController = require('../controllers/member.controller');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware');
const { handleValidation } = require('../middlewares/validation.middleware');

// All member routes require authentication
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/members/stats
 * Get member statistics
 */
router.get('/stats', MemberController.getStatistics);

/**
 * GET /api/members
 * Get all members
 */
router.get('/', [
    query('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Trạng thái không hợp lệ'),
    query('payment_type').optional().isIn(['per_visit', 'monthly']).withMessage('Loại thanh toán không hợp lệ'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit phải từ 1-100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset phải >= 0'),
    handleValidation
], MemberController.getAll);

/**
 * GET /api/members/:id
 * Get member by ID
 */
router.get('/:id', [
    param('id').isUUID().withMessage('ID không hợp lệ'),
    handleValidation
], MemberController.getById);

/**
 * POST /api/members
 * Create new member
 */
router.post('/', [
    body('full_name')
        .notEmpty().withMessage('Vui lòng nhập họ tên')
        .isLength({ min: 2, max: 100 }).withMessage('Họ tên từ 2-100 ký tự'),
    body('phone')
        .notEmpty().withMessage('Vui lòng nhập số điện thoại')
        .matches(/^[0-9]{10,11}$/).withMessage('Số điện thoại không hợp lệ'),
    body('email')
        .optional({ nullable: true, checkFalsy: true })
        .isEmail().withMessage('Email không hợp lệ'),
    body('payment_type')
        .optional()
        .isIn(['per_visit', 'monthly']).withMessage('Loại thanh toán không hợp lệ'),
    handleValidation
], MemberController.create);

/**
 * PUT /api/members/:id
 * Update member
 */
router.put('/:id', [
    param('id').isUUID().withMessage('ID không hợp lệ'),
    body('full_name')
        .optional()
        .isLength({ min: 2, max: 100 }).withMessage('Họ tên từ 2-100 ký tự'),
    body('phone')
        .optional()
        .matches(/^[0-9]{10,11}$/).withMessage('Số điện thoại không hợp lệ'),
    body('status')
        .optional()
        .isIn(['active', 'inactive', 'suspended']).withMessage('Trạng thái không hợp lệ'),
    handleValidation
], MemberController.update);

/**
 * DELETE /api/members/:id
 * Delete member
 */
router.delete('/:id', [
    param('id').isUUID().withMessage('ID không hợp lệ'),
    handleValidation
], MemberController.delete);

module.exports = router;
