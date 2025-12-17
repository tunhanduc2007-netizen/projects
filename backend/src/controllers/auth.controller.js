/**
 * Auth Controller
 * CLB Bóng Bàn Lê Quý Đôn
 */

const jwt = require('jsonwebtoken');
const AdminModel = require('../models/admin.model');
const logger = require('../utils/logger');

const AuthController = {
    /**
     * POST /api/auth/login
     * Admin login
     */
    async login(req, res) {
        try {
            const { username, password } = req.body;

            // Find admin by username
            const admin = await AdminModel.findByUsername(username);

            if (!admin) {
                logger.warn(`Login attempt with unknown username: ${username}`);
                return res.status(401).json({
                    success: false,
                    error: 'Tên đăng nhập hoặc mật khẩu không đúng'
                });
            }

            // Verify password
            const isValidPassword = await AdminModel.verifyPassword(password, admin.password_hash);

            if (!isValidPassword) {
                logger.warn(`Failed login attempt for: ${username}`);
                return res.status(401).json({
                    success: false,
                    error: 'Tên đăng nhập hoặc mật khẩu không đúng'
                });
            }

            // Update last login
            await AdminModel.updateLastLogin(admin.id);

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: admin.id,
                    username: admin.username,
                    role: admin.role
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            logger.info(`Admin logged in: ${username}`);

            res.json({
                success: true,
                message: 'Đăng nhập thành công',
                data: {
                    token,
                    admin: {
                        id: admin.id,
                        username: admin.username,
                        email: admin.email,
                        full_name: admin.full_name,
                        role: admin.role
                    }
                }
            });
        } catch (error) {
            logger.error('Login error:', error);
            res.status(500).json({
                success: false,
                error: 'Đã xảy ra lỗi khi đăng nhập'
            });
        }
    },

    /**
     * GET /api/auth/me
     * Get current admin info
     */
    async getMe(req, res) {
        try {
            const admin = await AdminModel.findById(req.user.id);

            if (!admin) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy tài khoản'
                });
            }

            res.json({
                success: true,
                data: admin
            });
        } catch (error) {
            logger.error('Get me error:', error);
            res.status(500).json({
                success: false,
                error: 'Đã xảy ra lỗi'
            });
        }
    },

    /**
     * POST /api/auth/change-password
     * Change admin password
     */
    async changePassword(req, res) {
        try {
            const { current_password, new_password } = req.body;

            const admin = await AdminModel.findByUsername(req.user.username);

            // Verify current password
            const isValid = await AdminModel.verifyPassword(current_password, admin.password_hash);

            if (!isValid) {
                return res.status(400).json({
                    success: false,
                    error: 'Mật khẩu hiện tại không đúng'
                });
            }

            // Update password
            await AdminModel.changePassword(req.user.id, new_password);

            logger.info(`Password changed for: ${req.user.username}`);

            res.json({
                success: true,
                message: 'Đổi mật khẩu thành công'
            });
        } catch (error) {
            logger.error('Change password error:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể đổi mật khẩu'
            });
        }
    },

    /**
     * POST /api/auth/logout
     * Logout (client-side token removal)
     */
    async logout(req, res) {
        res.json({
            success: true,
            message: 'Đăng xuất thành công'
        });
    }
};

module.exports = AuthController;
