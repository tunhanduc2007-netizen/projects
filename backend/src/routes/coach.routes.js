/**
 * Coach Routes
 * CLB Bóng Bàn Lê Quý Đôn
 */

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const CoachController = require('../controllers/coach.controller');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware');
const { handleValidation } = require('../middlewares/validation.middleware');

/**
 * GET /api/coaches
 * Get all coaches (public)
 */
router.get('/', CoachController.getAll);

/**
 * GET /api/coaches/:id
 * Get coach by ID (public)
 */
router.get('/:id', [
    param('id').isUUID().withMessage('ID không hợp lệ'),
    handleValidation
], CoachController.getById);

// Admin routes below
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * POST /api/coaches
 * Create new coach (admin only)
 */
router.post('/', [
    body('full_name')
        .notEmpty().withMessage('Vui lòng nhập họ tên')
        .isLength({ min: 2, max: 100 }).withMessage('Họ tên từ 2-100 ký tự'),
    body('experience_years')
        .optional()
        .isInt({ min: 0, max: 50 }).withMessage('Số năm kinh nghiệm từ 0-50'),
    body('hourly_rate')
        .optional()
        .isInt({ min: 0 }).withMessage('Học phí phải >= 0'),
    handleValidation
], CoachController.create);

/**
 * PUT /api/coaches/:id
 * Update coach (admin only)
 */
router.put('/:id', [
    param('id').isUUID().withMessage('ID không hợp lệ'),
    handleValidation
], CoachController.update);

/**
 * DELETE /api/coaches/:id
 * Delete coach (admin only)
 */
router.delete('/:id', [
    param('id').isUUID().withMessage('ID không hợp lệ'),
    handleValidation
], CoachController.delete);

module.exports = router;
