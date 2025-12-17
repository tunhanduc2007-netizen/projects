/**
 * System Log Controller
 * CLB Bóng Bàn Lê Quý Đôn
 */

const SystemLogModel = require('../models/systemLog.model');

const SystemLogController = {
    /**
     * Get recent system logs
     */
    async getRecent(req, res) {
        try {
            const logs = await SystemLogModel.getRecent(10);
            res.json({
                success: true,
                data: logs
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Không thể tải lịch sử hoạt động'
            });
        }
    }
};

module.exports = SystemLogController;
