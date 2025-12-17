/**
 * Schedule Controller
 * CLB Bóng Bàn Lê Quý Đôn
 */

const ScheduleModel = require('../models/schedule.model');
const logger = require('../utils/logger');

const ScheduleController = {
    /**
     * GET /api/schedule
     * Get full weekly schedule (public)
     */
    async getWeeklySchedule(req, res) {
        try {
            const schedule = await ScheduleModel.getWeeklySchedule();

            // Group by day of week
            const grouped = {
                1: { day: 'Thứ 2', shortDay: 'T2', slots: [] },
                2: { day: 'Thứ 3', shortDay: 'T3', slots: [] },
                3: { day: 'Thứ 4', shortDay: 'T4', slots: [] },
                4: { day: 'Thứ 5', shortDay: 'T5', slots: [] },
                5: { day: 'Thứ 6', shortDay: 'T6', slots: [] },
                6: { day: 'Thứ 7', shortDay: 'T7', slots: [] },
                7: { day: 'Chủ Nhật', shortDay: 'CN', slots: [] }
            };

            schedule.forEach(session => {
                if (grouped[session.day_of_week]) {
                    grouped[session.day_of_week].slots.push({
                        id: session.id,
                        time: `${session.start_time.substring(0, 5)} – ${session.end_time.substring(0, 5)}`,
                        coach: session.coach.full_name,
                        coach_id: session.coach.id,
                        avatar: session.coach.avatar_url,
                        hourly_rate: session.coach.hourly_rate,
                        table_fee: session.coach.table_fee,
                        session_type: session.session_type,
                        max_students: session.max_students,
                        current_students: session.current_students
                    });
                }
            });

            res.json({
                success: true,
                data: Object.values(grouped)
            });
        } catch (error) {
            logger.error('Get schedule error:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể tải lịch tập'
            });
        }
    },

    /**
     * GET /api/schedule/day/:dayOfWeek
     * Get schedule for specific day
     */
    async getByDay(req, res) {
        try {
            const { dayOfWeek } = req.params;
            const day = parseInt(dayOfWeek);

            if (isNaN(day) || day < 1 || day > 7) {
                return res.status(400).json({
                    success: false,
                    error: 'Ngày không hợp lệ (1-7)'
                });
            }

            const sessions = await ScheduleModel.getByDay(day);

            res.json({
                success: true,
                data: sessions
            });
        } catch (error) {
            logger.error('Get schedule by day error:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể tải lịch tập'
            });
        }
    },

    /**
     * GET /api/schedule/coach/:coachId
     * Get schedule for specific coach
     */
    async getByCoach(req, res) {
        try {
            const { coachId } = req.params;
            const sessions = await ScheduleModel.getByCoach(coachId);

            res.json({
                success: true,
                data: sessions
            });
        } catch (error) {
            logger.error('Get schedule by coach error:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể tải lịch tập'
            });
        }
    },

    /**
     * POST /api/schedule
     * Create new training session (admin only)
     */
    async create(req, res) {
        try {
            const session = await ScheduleModel.create(req.body);

            logger.info(`Training session created: ${session.id}`);

            res.status(201).json({
                success: true,
                message: 'Thêm lịch tập thành công',
                data: session
            });
        } catch (error) {
            logger.error('Create session error:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể thêm lịch tập'
            });
        }
    },

    /**
     * PUT /api/schedule/:id
     * Update training session (admin only)
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const session = await ScheduleModel.update(id, req.body);

            if (!session) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy lịch tập'
                });
            }

            logger.info(`Training session updated: ${id}`);

            res.json({
                success: true,
                message: 'Cập nhật lịch tập thành công',
                data: session
            });
        } catch (error) {
            logger.error('Update session error:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể cập nhật lịch tập'
            });
        }
    },

    /**
     * DELETE /api/schedule/:id
     * Delete training session (admin only)
     */
    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await ScheduleModel.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy lịch tập'
                });
            }

            logger.info(`Training session deleted: ${id}`);

            res.json({
                success: true,
                message: 'Xóa lịch tập thành công'
            });
        } catch (error) {
            logger.error('Delete session error:', error);
            res.status(500).json({
                success: false,
                error: 'Không thể xóa lịch tập'
            });
        }
    }
};

module.exports = ScheduleController;
