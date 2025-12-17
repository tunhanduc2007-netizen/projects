/**
 * Contact Form Routes
 * CLB Bóng Bàn Lê Quý Đôn
 */

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { query } = require('../config/database');
const logger = require('../utils/logger');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware');
const { handleValidation } = require('../middlewares/validation.middleware');

/**
 * POST /api/contact
 * Submit contact form (public)
 */
router.post('/', [
    body('name')
        .notEmpty().withMessage('Vui lòng nhập họ tên')
        .isLength({ min: 2, max: 100 }).withMessage('Họ tên từ 2-100 ký tự'),
    body('phone')
        .notEmpty().withMessage('Vui lòng nhập số điện thoại')
        .matches(/^[0-9]{10,11}$/).withMessage('Số điện thoại không hợp lệ'),
    body('message')
        .notEmpty().withMessage('Vui lòng nhập tin nhắn')
        .isLength({ min: 10, max: 2000 }).withMessage('Tin nhắn từ 10-2000 ký tự'),
    body('email')
        .optional({ nullable: true, checkFalsy: true })
        .isEmail().withMessage('Email không hợp lệ'),
    handleValidation
], async (req, res) => {
    try {
        const { name, phone, email, subject, message } = req.body;

        const sql = `
            INSERT INTO contact_forms (name, phone, email, subject, message)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, created_at
        `;
        const result = await query(sql, [name, phone, email || null, subject || 'Liên hệ chung', message]);

        logger.info(`New contact form submitted: ${name} (${phone})`);

        res.status(201).json({
            success: true,
            message: 'Gửi tin nhắn thành công! Chúng tôi sẽ liên hệ bạn sớm.',
            data: result.rows[0]
        });
    } catch (error) {
        logger.error('Submit contact form error:', error);
        res.status(500).json({
            success: false,
            error: 'Không thể gửi tin nhắn. Vui lòng thử lại.'
        });
    }
});

// Admin routes
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/contact
 * Get all contact forms (admin only)
 */
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        let sql = `
            SELECT id, name, phone, email, subject, message, status, replied_at, created_at
            FROM contact_forms
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            sql += ` AND status = $1`;
            params.push(status);
        }

        sql += ' ORDER BY created_at DESC';

        const result = await query(sql, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        logger.error('Get contacts error:', error);
        res.status(500).json({
            success: false,
            error: 'Không thể tải danh sách liên hệ'
        });
    }
});

/**
 * PUT /api/contact/:id/status
 * Update contact form status (admin only)
 */
router.put('/:id/status', [
    param('id').isUUID().withMessage('ID không hợp lệ'),
    body('status').isIn(['new', 'read', 'replied', 'archived']).withMessage('Trạng thái không hợp lệ'),
    handleValidation
], async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        let sql = `
            UPDATE contact_forms 
            SET status = $1, notes = COALESCE($2, notes)
        `;
        const params = [status, notes];

        if (status === 'replied') {
            sql += `, replied_at = CURRENT_TIMESTAMP, replied_by = $3`;
            params.push(req.user.id);
        }

        sql += ` WHERE id = $${params.length + 1} RETURNING *`;
        params.push(id);

        const result = await query(sql, params);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy liên hệ'
            });
        }

        res.json({
            success: true,
            message: 'Cập nhật trạng thái thành công',
            data: result.rows[0]
        });
    } catch (error) {
        logger.error('Update contact status error:', error);
        res.status(500).json({
            success: false,
            error: 'Không thể cập nhật trạng thái'
        });
    }
});

/**
 * DELETE /api/contact/:id
 * Delete contact form (admin only)
 */
router.delete('/:id', [
    param('id').isUUID().withMessage('ID không hợp lệ'),
    handleValidation
], async (req, res) => {
    try {
        const { id } = req.params;
        const sql = 'DELETE FROM contact_forms WHERE id = $1 RETURNING id';
        const result = await query(sql, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy liên hệ'
            });
        }

        res.json({
            success: true,
            message: 'Xóa liên hệ thành công'
        });
    } catch (error) {
        logger.error('Delete contact error:', error);
        res.status(500).json({
            success: false,
            error: 'Không thể xóa liên hệ'
        });
    }
});

module.exports = router;
