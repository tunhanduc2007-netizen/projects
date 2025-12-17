/**
 * Event Routes
 * CLB Bóng Bàn Lê Quý Đôn
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const logger = require('../utils/logger');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware');

/**
 * GET /api/events
 * Get all events (public)
 */
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        let sql = `
            SELECT id, title, description, event_date, start_time::text, end_time::text,
                   location, image_url, max_participants, registration_fee, status, created_at
            FROM events
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            sql += ` AND status = $1`;
            params.push(status);
        }

        sql += ' ORDER BY event_date DESC';

        const result = await query(sql, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        logger.error('Get events error:', error);
        res.status(500).json({
            success: false,
            error: 'Không thể tải danh sách sự kiện'
        });
    }
});

/**
 * GET /api/events/:id
 * Get event by ID (public)
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = 'SELECT * FROM events WHERE id = $1';
        const result = await query(sql, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy sự kiện'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        logger.error('Get event error:', error);
        res.status(500).json({
            success: false,
            error: 'Không thể tải thông tin sự kiện'
        });
    }
});

// Admin routes
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * POST /api/events
 * Create event (admin only)
 */
router.post('/', async (req, res) => {
    try {
        const { title, description, event_date, start_time, end_time, location, image_url, max_participants, registration_fee } = req.body;

        const sql = `
            INSERT INTO events (title, description, event_date, start_time, end_time, location, image_url, max_participants, registration_fee)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        const result = await query(sql, [title, description, event_date, start_time, end_time, location, image_url, max_participants, registration_fee]);

        res.status(201).json({
            success: true,
            message: 'Thêm sự kiện thành công',
            data: result.rows[0]
        });
    } catch (error) {
        logger.error('Create event error:', error);
        res.status(500).json({
            success: false,
            error: 'Không thể thêm sự kiện'
        });
    }
});

/**
 * PUT /api/events/:id
 * Update event (admin only)
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, event_date, start_time, end_time, location, image_url, max_participants, registration_fee, status } = req.body;

        const sql = `
            UPDATE events 
            SET title = COALESCE($1, title),
                description = COALESCE($2, description),
                event_date = COALESCE($3, event_date),
                start_time = COALESCE($4, start_time),
                end_time = COALESCE($5, end_time),
                location = COALESCE($6, location),
                image_url = COALESCE($7, image_url),
                max_participants = COALESCE($8, max_participants),
                registration_fee = COALESCE($9, registration_fee),
                status = COALESCE($10, status)
            WHERE id = $11
            RETURNING *
        `;
        const result = await query(sql, [title, description, event_date, start_time, end_time, location, image_url, max_participants, registration_fee, status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy sự kiện'
            });
        }

        res.json({
            success: true,
            message: 'Cập nhật sự kiện thành công',
            data: result.rows[0]
        });
    } catch (error) {
        logger.error('Update event error:', error);
        res.status(500).json({
            success: false,
            error: 'Không thể cập nhật sự kiện'
        });
    }
});

/**
 * DELETE /api/events/:id
 * Delete event (admin only)
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = 'DELETE FROM events WHERE id = $1 RETURNING id';
        const result = await query(sql, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy sự kiện'
            });
        }

        res.json({
            success: true,
            message: 'Xóa sự kiện thành công'
        });
    } catch (error) {
        logger.error('Delete event error:', error);
        res.status(500).json({
            success: false,
            error: 'Không thể xóa sự kiện'
        });
    }
});

module.exports = router;
