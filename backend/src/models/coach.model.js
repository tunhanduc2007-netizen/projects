/**
 * Coach Model
 * CLB Bóng Bàn Lê Quý Đôn
 */

const { query } = require('../config/database');

const CoachModel = {
    /**
     * Get all coaches with their schedule
     */
    async findAll({ status = 'active' } = {}) {
        const sql = `
            SELECT 
                c.id, c.full_name, c.phone, c.email, c.experience_years,
                c.bio, c.avatar_url, c.hourly_rate, c.table_fee,
                c.rating, c.total_students, c.badges, c.status,
                c.created_at, c.updated_at,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', ts.id,
                            'day_of_week', ts.day_of_week,
                            'start_time', ts.start_time::text,
                            'end_time', ts.end_time::text,
                            'session_type', ts.session_type,
                            'status', ts.status
                        ) ORDER BY ts.day_of_week, ts.start_time
                    ) FILTER (WHERE ts.id IS NOT NULL),
                    '[]'
                ) as schedule
            FROM coaches c
            LEFT JOIN training_sessions ts ON c.id = ts.coach_id AND ts.status = 'active'
            WHERE c.status = $1
            GROUP BY c.id
            ORDER BY c.created_at
        `;
        const result = await query(sql, [status]);
        return result.rows;
    },

    /**
     * Get coach by ID
     */
    async findById(id) {
        const sql = `
            SELECT 
                c.*,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', ts.id,
                            'day_of_week', ts.day_of_week,
                            'start_time', ts.start_time::text,
                            'end_time', ts.end_time::text,
                            'session_type', ts.session_type,
                            'status', ts.status
                        ) ORDER BY ts.day_of_week, ts.start_time
                    ) FILTER (WHERE ts.id IS NOT NULL),
                    '[]'
                ) as schedule
            FROM coaches c
            LEFT JOIN training_sessions ts ON c.id = ts.coach_id
            WHERE c.id = $1
            GROUP BY c.id
        `;
        const result = await query(sql, [id]);
        return result.rows[0];
    },

    /**
     * Create new coach
     */
    async create(data) {
        const sql = `
            INSERT INTO coaches (
                full_name, phone, email, experience_years, bio,
                avatar_url, hourly_rate, table_fee, badges
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        const params = [
            data.full_name,
            data.phone || null,
            data.email || null,
            data.experience_years || 0,
            data.bio || null,
            data.avatar_url || null,
            data.hourly_rate || 250000,
            data.table_fee || 50000,
            data.badges || []
        ];
        const result = await query(sql, params);
        return result.rows[0];
    },

    /**
     * Update coach
     */
    async update(id, data) {
        const updates = [];
        const params = [];
        let paramIndex = 1;

        const allowedFields = [
            'full_name', 'phone', 'email', 'experience_years', 'bio',
            'avatar_url', 'hourly_rate', 'table_fee', 'rating',
            'total_students', 'badges', 'status'
        ];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updates.push(`${field} = $${paramIndex++}`);
                params.push(data[field]);
            }
        }

        if (updates.length === 0) {
            return this.findById(id);
        }

        params.push(id);
        const sql = `
            UPDATE coaches 
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await query(sql, params);
        return result.rows[0];
    },

    /**
     * Delete coach
     */
    async delete(id) {
        const sql = 'DELETE FROM coaches WHERE id = $1 RETURNING id';
        const result = await query(sql, [id]);
        return result.rows[0];
    }
};

module.exports = CoachModel;
