/**
 * Member Controller
 * CLB Bóng Bàn Lê Quý Đôn
 */

const MemberModel = require('../models/member.model');
const logger = require('../utils/logger');

const MemberController = {
    /**
     * GET /api/members
     * Get all members with optional filters
     */
    async getAll(req, res) {
        try {
            const { status, payment_type, limit, offset } = req.query;

            const members = await MemberModel.findAll({
                status,
                payment_type,
                limit: parseInt(limit) || 50,
                offset: parseInt(offset) || 0
            });

            const total = await MemberModel.count({ status });

            res.json({
                success: true,
                data: members,
                pagination: {
                    total,
                    limit: parseInt(limit) || 50,
                    offset: parseInt(offset) || 0
                }
            });
        } catch (error) {
            logger.error('Get members error:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể tải danh sách học viên'
            });
        }
    },

    /**
     * GET /api/members/:id
     * Get single member by ID
     */
    async getById(req, res) {
        try {
            const { id } = req.params;
            const member = await MemberModel.findById(id);

            if (!member) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy học viên'
                });
            }

            res.json({
                success: true,
                data: member
            });
        } catch (error) {
            logger.error('Get member by ID error:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể tải thông tin học viên'
            });
        }
    },

    /**
     * POST /api/members
     * Create new member
     */
    async create(req, res) {
        try {
            const { full_name, phone, email, date_of_birth, address, join_date, payment_type, notes } = req.body;

            // Check if phone already exists
            const existingMember = await MemberModel.findByPhone(phone);
            if (existingMember) {
                return res.status(400).json({
                    success: false,
                    error: 'Số điện thoại đã được đăng ký'
                });
            }

            const member = await MemberModel.create({
                full_name,
                phone,
                email,
                date_of_birth,
                address,
                join_date,
                payment_type,
                notes
            });

            logger.info(`New member created: ${member.full_name} (${member.id})`);

            res.status(201).json({
                success: true,
                message: 'Thêm học viên thành công',
                data: member
            });
        } catch (error) {
            logger.error('Create member error:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể thêm học viên'
            });
        }
    },

    /**
     * PUT /api/members/:id
     * Update member
     */
    async update(req, res) {
        try {
            const { id } = req.params;

            // Check if member exists
            const existingMember = await MemberModel.findById(id);
            if (!existingMember) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy học viên'
                });
            }

            const member = await MemberModel.update(id, req.body);

            logger.info(`Member updated: ${member.full_name} (${member.id})`);

            res.json({
                success: true,
                message: 'Cập nhật học viên thành công',
                data: member
            });
        } catch (error) {
            logger.error('Update member error:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể cập nhật học viên'
            });
        }
    },

    /**
     * DELETE /api/members/:id
     * Delete member
     */
    async delete(req, res) {
        try {
            const { id } = req.params;

            const deleted = await MemberModel.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy học viên'
                });
            }

            logger.info(`Member deleted: ${id}`);

            res.json({
                success: true,
                message: 'Xóa học viên thành công'
            });
        } catch (error) {
            logger.error('Delete member error:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể xóa học viên'
            });
        }
    },

    /**
     * GET /api/members/stats
     * Get member statistics
     */
    async getStatistics(req, res) {
        try {
            const stats = await MemberModel.getStatistics();

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            logger.error('Get member stats error:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể tải thống kê'
            });
        }
    }
};

module.exports = MemberController;
