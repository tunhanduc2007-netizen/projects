/**
 * System Log Model
 * CLB Bóng Bàn Lê Quý Đôn
 */

const { query } = require('../config/database');

const SystemLogModel = {
    /**
     * Create a new log entry
     */
    async create({ action_type, description }) {
        const sql = `
            INSERT INTO system_logs (action_type, description)
            VALUES ($1, $2)
            RETURNING *
        `;
        try {
            const result = await query(sql, [action_type, description]);
            return result.rows[0];
        } catch (error) {
            console.error('Failed to create system log:', error);
            return null; // Don't crash if logging fails
        }
    },

    /**
     * Get recent logs
     */
    async getRecent(limit = 10) {
        const sql = `
            SELECT *
            FROM system_logs
            ORDER BY created_at DESC
            LIMIT $1
        `;
        const result = await query(sql, [limit]);
        return result.rows;
    }
};

module.exports = SystemLogModel;
