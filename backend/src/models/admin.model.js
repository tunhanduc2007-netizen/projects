/**
 * Admin Model
 * CLB Bóng Bàn Lê Quý Đôn
 */

const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

const AdminModel = {
    /**
     * Find admin by username
     */
    async findByUsername(username) {
        const sql = 'SELECT * FROM admins WHERE username = $1 AND is_active = true';
        const result = await query(sql, [username]);
        return result.rows[0];
    },

    /**
     * Find admin by ID
     */
    async findById(id) {
        const sql = `
            SELECT id, username, email, full_name, role, is_active, last_login, created_at
            FROM admins WHERE id = $1
        `;
        const result = await query(sql, [id]);
        return result.rows[0];
    },

    /**
     * Verify password
     */
    async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    },

    /**
     * Update last login
     */
    async updateLastLogin(id) {
        const sql = 'UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1';
        await query(sql, [id]);
    },

    /**
     * Create admin
     */
    async create(data) {
        const passwordHash = await bcrypt.hash(data.password, 10);
        const sql = `
            INSERT INTO admins (username, password_hash, email, full_name, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, username, email, full_name, role, created_at
        `;
        const params = [
            data.username,
            passwordHash,
            data.email || null,
            data.full_name || null,
            data.role || 'admin'
        ];
        const result = await query(sql, params);
        return result.rows[0];
    },

    /**
     * Change password
     */
    async changePassword(id, newPassword) {
        const passwordHash = await bcrypt.hash(newPassword, 10);
        const sql = 'UPDATE admins SET password_hash = $1 WHERE id = $2';
        await query(sql, [passwordHash, id]);
    }
};

module.exports = AdminModel;
