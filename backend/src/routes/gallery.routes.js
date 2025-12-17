/**
 * Gallery Routes
 * CLB Bóng Bàn Lê Quý Đôn
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const logger = require('../utils/logger');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware');

/**
 * GET /api/gallery
 * Get all gallery images (public)
 */
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        let sql = `
            SELECT id, title, description, image_url, category, sort_order, is_featured, created_at
            FROM gallery
            WHERE 1=1
        `;
        const params = [];

        if (category) {
            sql += ` AND category = $1`;
            params.push(category);
        }

        sql += ' ORDER BY sort_order, created_at DESC';

        const result = await query(sql, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        logger.error('Get gallery error:', error);
        res.status(500).json({
            success: false,
            error: 'Không thể tải thư viện ảnh'
        });
    }
});

/**
 * GET /api/gallery/featured
 * Get featured images (public)
 */
router.get('/featured', async (req, res) => {
    try {
        const sql = `
            SELECT id, title, description, image_url, category
            FROM gallery
            WHERE is_featured = true
            ORDER BY sort_order
            LIMIT 10
        `;
        const result = await query(sql);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        logger.error('Get featured gallery error:', error);
        res.status(500).json({
            success: false,
            error: 'Không thể tải ảnh nổi bật'
        });
    }
});

// Admin routes
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * POST /api/gallery
 * Create gallery image (admin only)
 */
router.post('/', async (req, res) => {
    try {
        const { title, description, image_url, category, sort_order, is_featured } = req.body;

        const sql = `
            INSERT INTO gallery (title, description, image_url, category, sort_order, is_featured)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const result = await query(sql, [title, description, image_url, category || 'general', sort_order || 0, is_featured || false]);

        res.status(201).json({
            success: true,
            message: 'Thêm ảnh thành công',
            data: result.rows[0]
        });
    } catch (error) {
        logger.error('Create gallery error:', error);
        res.status(500).json({
            success: false,
            error: 'Không thể thêm ảnh'
        });
    }
});

/**
 * DELETE /api/gallery/:id
 * Delete gallery image (admin only)
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = 'DELETE FROM gallery WHERE id = $1 RETURNING id';
        const result = await query(sql, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy ảnh'
            });
        }

        res.json({
            success: true,
            message: 'Xóa ảnh thành công'
        });
    } catch (error) {
        logger.error('Delete gallery error:', error);
        res.status(500).json({
            success: false,
            error: 'Không thể xóa ảnh'
        });
    }
});

module.exports = router;
