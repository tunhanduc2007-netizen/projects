/**
 * Member Model
 * CLB Bóng Bàn Lê Quý Đôn
 */

const { query } = require('../config/database');

const MemberModel = {
    /**
     * Get all members with optional filters
     */
    async findAll({ status, payment_type, limit = 50, offset = 0 } = {}) {
        let sql = `
            SELECT 
                id, full_name, phone, email, date_of_birth, address,
                join_date, payment_type, monthly_expiry, status, notes,
                created_at, updated_at
            FROM members
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (status) {
            sql += ` AND status = $${paramIndex++}`;
            params.push(status);
        }

        if (payment_type) {
            sql += ` AND payment_type = $${paramIndex++}`;
            params.push(payment_type);
        }

        sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
        params.push(limit, offset);

        const result = await query(sql, params);
        return result.rows;
    },

    /**
     * Get member by ID
     */
    async findById(id) {
        const sql = `
            SELECT 
                id, full_name, phone, email, date_of_birth, address,
                join_date, payment_type, monthly_expiry, status, notes,
                referred_by, created_at, updated_at
            FROM members
            WHERE id = $1
        `;
        const result = await query(sql, [id]);
        return result.rows[0];
    },

    /**
     * Get member by phone
     */
    async findByPhone(phone) {
        const sql = 'SELECT * FROM members WHERE phone = $1';
        const result = await query(sql, [phone]);
        return result.rows[0];
    },

    /**
     * Create new member
     */
    async create(data) {
        const sql = `
            INSERT INTO members (full_name, phone, email, date_of_birth, address, join_date, payment_type, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const params = [
            data.full_name,
            data.phone,
            data.email || null,
            data.date_of_birth || null,
            data.address || null,
            data.join_date || new Date(),
            data.payment_type || 'per_visit',
            data.notes || null
        ];
        const result = await query(sql, params);
        return result.rows[0];
    },

    /**
     * Update member
     */
    async update(id, data) {
        const updates = [];
        const params = [];
        let paramIndex = 1;

        const allowedFields = [
            'full_name', 'phone', 'email', 'date_of_birth', 'address',
            'payment_type', 'monthly_expiry', 'status', 'notes'
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
            UPDATE members 
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await query(sql, params);
        return result.rows[0];
    },

    /**
     * Delete member
     */
    async delete(id) {
        const sql = 'DELETE FROM members WHERE id = $1 RETURNING id';
        const result = await query(sql, [id]);
        return result.rows[0];
    },

    /**
     * Count total members
     */
    async count({ status } = {}) {
        let sql = 'SELECT COUNT(*) as total FROM members WHERE 1=1';
        const params = [];

        if (status) {
            sql += ' AND status = $1';
            params.push(status);
        }

        const result = await query(sql, params);
        return parseInt(result.rows[0].total);
    },

    /**
     * Get member statistics
     */
    async getStatistics() {
        const sql = `
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'active') as active,
                COUNT(*) FILTER (WHERE payment_type = 'monthly') as monthly_members,
                COUNT(*) FILTER (WHERE payment_type = 'per_visit') as per_visit_members,
                COUNT(*) FILTER (WHERE join_date >= CURRENT_DATE - INTERVAL '30 days') as new_this_month
            FROM members
        `;
        const result = await query(sql);
        return result.rows[0];
    }
};

module.exports = MemberModel;
