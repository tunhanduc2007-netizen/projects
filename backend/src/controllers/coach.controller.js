/**
 * Coach Controller
 * CLB Bóng Bàn Lê Quý Đôn
 */

const CoachModel = require('../models/coach.model');
const logger = require('../utils/logger');

const CoachController = {
    /**
     * GET /api/coaches
     * Get all coaches (public)
     */
    async getAll(req, res) {
        try {
            const { status } = req.query;
            const coaches = await CoachModel.findAll({ status: status || 'active' });

            res.json({
                success: true,
                data: coaches
            });
        } catch (error) {
            logger.error('Get coaches error:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể tải danh sách HLV'
            });
        }
    },

    /**
     * GET /api/coaches/:id
     * Get single coach
     */
    async getById(req, res) {
        try {
            const { id } = req.params;
            const coach = await CoachModel.findById(id);

            if (!coach) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy HLV'
                });
            }

            res.json({
                success: true,
                data: coach
            });
        } catch (error) {
            logger.error('Get coach by ID error:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể tải thông tin HLV'
            });
        }
    },

    /**
     * POST /api/coaches
     * Create new coach (admin only)
     */
    async create(req, res) {
        try {
            const coach = await CoachModel.create(req.body);

            logger.info(`Coach created: ${coach.full_name} (${coach.id})`);

            res.status(201).json({
                success: true,
                message: 'Thêm HLV thành công',
                data: coach
            });
        } catch (error) {
            logger.error('Create coach error:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể thêm HLV'
            });
        }
    },

    /**
     * PUT /api/coaches/:id
     * Update coach (admin only)
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const coach = await CoachModel.update(id, req.body);

            if (!coach) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy HLV'
                });
            }

            logger.info(`Coach updated: ${coach.full_name} (${coach.id})`);

            res.json({
                success: true,
                message: 'Cập nhật HLV thành công',
                data: coach
            });
        } catch (error) {
            logger.error('Update coach error:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể cập nhật HLV'
            });
        }
    },

    /**
     * DELETE /api/coaches/:id
     * Delete coach (admin only)
     */
    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await CoachModel.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy HLV'
                });
            }

            logger.info(`Coach deleted: ${id}`);

            res.json({
                success: true,
                message: 'Xóa HLV thành công'
            });
        } catch (error) {
            logger.error('Delete coach error:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể xóa HLV'
            });
        }
    }
};

module.exports = CoachController;
