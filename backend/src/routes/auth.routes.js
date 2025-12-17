/**
 * Auth Routes
 * CLB Bóng Bàn Lê Quý Đôn
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AuthController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { handleValidation } = require('../middlewares/validation.middleware');

/**
 * POST /api/auth/login
 * Admin login
 */
router.post('/login', [
    body('username')
        .notEmpty().withMessage('Vui lòng nhập tên đăng nhập')
        .isLength({ min: 3, max: 50 }).withMessage('Tên đăng nhập từ 3-50 ký tự'),
    body('password')
        .notEmpty().withMessage('Vui lòng nhập mật khẩu')
        .isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự'),
    handleValidation
], AuthController.login);

/**
 * GET /api/auth/me
 * Get current admin info
 */
router.get('/me', authenticateToken, AuthController.getMe);

/**
 * POST /api/auth/change-password
 * Change password
 */
router.post('/change-password', [
    authenticateToken,
    body('current_password')
        .notEmpty().withMessage('Vui lòng nhập mật khẩu hiện tại'),
    body('new_password')
        .notEmpty().withMessage('Vui lòng nhập mật khẩu mới')
        .isLength({ min: 8 }).withMessage('Mật khẩu mới tối thiểu 8 ký tự')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Mật khẩu phải có chữ hoa, chữ thường và số'),
    handleValidation
], AuthController.changePassword);

/**
 * POST /api/auth/logout
 * Logout
 */
router.post('/logout', authenticateToken, AuthController.logout);

module.exports = router;
