/**
 * Create Admin User Script
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'clb_bongban',
    user: 'postgres',
    password: 'Chaobacon1234'
});

async function createAdmin() {
    try {
        // Check if admin already exists
        const checkResult = await pool.query(
            "SELECT username FROM admins WHERE username = 'admin'"
        );

        if (checkResult.rows.length > 0) {
            console.log('⚠️  Admin user already exists. Updating password...');

            // Update existing admin's password
            const newPassword = 'admin123';
            const hash = await bcrypt.hash(newPassword, 10);

            await pool.query(
                "UPDATE admins SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE username = 'admin'",
                [hash]
            );

            console.log('✅ Admin password updated successfully!');
        } else {
            console.log('📝 Creating new admin user...');

            // Create new admin
            const newPassword = 'admin123';
            const hash = await bcrypt.hash(newPassword, 10);

            await pool.query(`
                INSERT INTO admins (username, password_hash, email, full_name, role)
                VALUES ($1, $2, $3, $4, $5)
            `, ['admin', hash, 'admin@clbbongban.com', 'Admin CLB Bóng Bàn', 'super_admin']);

            console.log('✅ Admin user created successfully!');
        }

        console.log('');
        console.log('🔐 Login credentials:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        console.log('');
        console.log('📍 Admin Panel: http://localhost:5173/admin');

        await pool.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createAdmin();
