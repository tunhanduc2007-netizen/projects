/**
 * Training Session Model
 * CLB Bóng Bàn Lê Quý Đôn
 */

const { query } = require('../config/database');

const ScheduleModel = {
    /**
     * Get full weekly schedule with coach info
     */
    async getWeeklySchedule() {
        const sql = `
            SELECT 
                ts.id,
                ts.day_of_week,
                ts.start_time::text,
                ts.end_time::text,
                ts.max_students,
                ts.current_students,
                ts.session_type,
                ts.status,
                json_build_object(
                    'id', c.id,
                    'full_name', c.full_name,
                    'avatar_url', c.avatar_url,
                    'hourly_rate', c.hourly_rate,
                    'table_fee', c.table_fee
                ) as coach
            FROM training_sessions ts
            JOIN coaches c ON ts.coach_id = c.id
            WHERE ts.status = 'active' AND c.status = 'active'
            ORDER BY ts.day_of_week, ts.start_time
        `;
        const result = await query(sql);
        return result.rows;
    },

    /**
     * Get schedule by day of week
     */
    async getByDay(dayOfWeek) {
        const sql = `
            SELECT 
                ts.id,
                ts.day_of_week,
                ts.start_time::text,
                ts.end_time::text,
                ts.max_students,
                ts.current_students,
                ts.session_type,
                ts.status,
                json_build_object(
                    'id', c.id,
                    'full_name', c.full_name,
                    'avatar_url', c.avatar_url
                ) as coach
            FROM training_sessions ts
            JOIN coaches c ON ts.coach_id = c.id
            WHERE ts.day_of_week = $1 AND ts.status = 'active' AND c.status = 'active'
            ORDER BY ts.start_time
        `;
        const result = await query(sql, [dayOfWeek]);
        return result.rows;
    },

    /**
     * Get schedule by coach
     */
    async getByCoach(coachId) {
        const sql = `
            SELECT 
                id, day_of_week, start_time::text, end_time::text,
                max_students, current_students, session_type, status
            FROM training_sessions
            WHERE coach_id = $1
            ORDER BY day_of_week, start_time
        `;
        const result = await query(sql, [coachId]);
        return result.rows;
    },

    /**
     * Create training session
     */
    async create(data) {
        const sql = `
            INSERT INTO training_sessions (
                coach_id, day_of_week, start_time, end_time,
                max_students, session_type, notes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const params = [
            data.coach_id,
            data.day_of_week,
            data.start_time,
            data.end_time,
            data.max_students || 5,
            data.session_type || 'private',
            data.notes || null
        ];
        const result = await query(sql, params);
        return result.rows[0];
    },

    /**
     * Update training session
     */
    async update(id, data) {
        const updates = [];
        const params = [];
        let paramIndex = 1;

        const allowedFields = [
            'day_of_week', 'start_time', 'end_time',
            'max_students', 'session_type', 'status', 'notes'
        ];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updates.push(`${field} = $${paramIndex++}`);
                params.push(data[field]);
            }
        }

        if (updates.length === 0) {
            return null;
        }

        params.push(id);
        const sql = `
            UPDATE training_sessions 
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await query(sql, params);
        return result.rows[0];
    },

    /**
     * Delete training session
     */
    async delete(id) {
        const sql = 'DELETE FROM training_sessions WHERE id = $1 RETURNING id';
        const result = await query(sql, [id]);
        return result.rows[0];
    }
};

module.exports = ScheduleModel;
