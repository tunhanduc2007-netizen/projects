/**
 * Payment Model
 * CLB Bóng Bàn Lê Quý Đôn
 */

const { query } = require('../config/database');

const PaymentModel = {
    /**
     * Get all payments with optional filters
     */
    async findAll({ member_id, payment_type, from_date, to_date, limit = 50, offset = 0 } = {}) {
        let sql = `
            SELECT 
                p.id, p.amount, p.payment_type, p.payment_method,
                p.description, p.notes, p.receipt_number, p.paid_at,
                p.created_at,
                json_build_object(
                    'id', m.id,
                    'full_name', m.full_name,
                    'phone', m.phone
                ) as member
            FROM payments p
            JOIN members m ON p.member_id = m.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (member_id) {
            sql += ` AND p.member_id = $${paramIndex++}`;
            params.push(member_id);
        }

        if (payment_type) {
            sql += ` AND p.payment_type = $${paramIndex++}`;
            params.push(payment_type);
        }

        if (from_date) {
            sql += ` AND p.paid_at >= $${paramIndex++}`;
            params.push(from_date);
        }

        if (to_date) {
            sql += ` AND p.paid_at <= $${paramIndex++}`;
            params.push(to_date);
        }

        sql += ` ORDER BY p.paid_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
        params.push(limit, offset);

        const result = await query(sql, params);
        return result.rows;
    },

    /**
     * Get payment by ID
     */
    async findById(id) {
        const sql = `
            SELECT 
                p.*,
                json_build_object(
                    'id', m.id,
                    'full_name', m.full_name,
                    'phone', m.phone
                ) as member
            FROM payments p
            JOIN members m ON p.member_id = m.id
            WHERE p.id = $1
        `;
        const result = await query(sql, [id]);
        return result.rows[0];
    },

    /**
     * Create payment
     */
    async create(data) {
        const sql = `
            INSERT INTO payments (
                member_id, amount, payment_type, payment_method,
                description, notes, receipt_number, paid_at, recorded_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, CURRENT_TIMESTAMP), $9)
            RETURNING *
        `;
        const params = [
            data.member_id,
            data.amount,
            data.payment_type,
            data.payment_method || 'cash',
            data.description || null,
            data.notes || null,
            data.receipt_number || null,
            data.paid_at || null,
            data.recorded_by || null
        ];
        const result = await query(sql, params);

        // If monthly payment, update member's monthly_expiry
        if (data.payment_type === 'monthly') {
            await query(`
                UPDATE members 
                SET monthly_expiry = COALESCE(monthly_expiry, CURRENT_DATE) + INTERVAL '30 days'
                WHERE id = $1
            `, [data.member_id]);
        }

        return result.rows[0];
    },

    /**
     * Get payment statistics
     */
    async getStatistics({ from_date, to_date } = {}) {
        let dateFilter = '';
        const params = [];

        if (from_date && to_date) {
            dateFilter = 'WHERE paid_at BETWEEN $1 AND $2';
            params.push(from_date, to_date);
        }

        const sql = `
            SELECT 
                COUNT(*) as total_transactions,
                COALESCE(SUM(amount), 0) as total_revenue,
                COALESCE(SUM(amount) FILTER (WHERE payment_type = 'per_visit'), 0) as per_visit_revenue,
                COALESCE(SUM(amount) FILTER (WHERE payment_type = 'monthly'), 0) as monthly_revenue,
                COALESCE(SUM(amount) FILTER (WHERE payment_type = 'coach_fee'), 0) as coach_fee_revenue
            FROM payments
            ${dateFilter}
        `;

        const result = await query(sql, params);
        return result.rows[0];
    },

    /**
     * Delete payment
     */
    async delete(id) {
        const sql = 'DELETE FROM payments WHERE id = $1 RETURNING id';
        const result = await query(sql, [id]);
        return result.rows[0];
    }
};

module.exports = PaymentModel;
