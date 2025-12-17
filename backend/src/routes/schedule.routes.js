/**
 * Schedule Routes
 * CLB Bóng Bàn Lê Quý Đôn
 */

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const ScheduleController = require('../controllers/schedule.controller');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware');
const { handleValidation } = require('../middlewares/validation.middleware');

/**
 * GET /api/schedule
 * Get weekly schedule (public)
 */
router.get('/', ScheduleController.getWeeklySchedule);

/**
 * GET /api/schedule/day/:dayOfWeek
 * Get schedule for specific day (public)
 */
router.get('/day/:dayOfWeek', ScheduleController.getByDay);

/**
 * GET /api/schedule/coach/:coachId
 * Get schedule for specific coach (public)
 */
router.get('/coach/:coachId', [
    param('coachId').isUUID().withMessage('Coach ID không hợp lệ'),
    handleValidation
], ScheduleController.getByCoach);

// Admin routes below
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * POST /api/schedule
 * Create training session (admin only)
 */
router.post('/', [
    body('coach_id')
        .notEmpty().withMessage('Vui lòng chọn HLV')
        .isUUID().withMessage('Coach ID không hợp lệ'),
    body('day_of_week')
        .notEmpty().withMessage('Vui lòng chọn ngày')
        .isInt({ min: 1, max: 7 }).withMessage('Ngày phải từ 1-7'),
    body('start_time')
        .notEmpty().withMessage('Vui lòng nhập giờ bắt đầu')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Giờ bắt đầu không hợp lệ'),
    body('end_time')
        .notEmpty().withMessage('Vui lòng nhập giờ kết thúc')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Giờ kết thúc không hợp lệ'),
    handleValidation
], ScheduleController.create);

/**
 * PUT /api/schedule/:id
 * Update training session (admin only)
 */
router.put('/:id', [
    param('id').isUUID().withMessage('ID không hợp lệ'),
    handleValidation
], ScheduleController.update);

/**
 * DELETE /api/schedule/:id
 * Delete training session (admin only)
 */
router.delete('/:id', [
    param('id').isUUID().withMessage('ID không hợp lệ'),
    handleValidation
], ScheduleController.delete);

module.exports = router;
