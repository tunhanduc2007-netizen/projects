/**
 * Update Admin Password Script
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

async function updatePassword() {
    const newPassword = 'admin123';
    const hash = await bcrypt.hash(newPassword, 10);

    await pool.query(
        "UPDATE admins SET password_hash = $1 WHERE username = 'admin'",
        [hash]
    );

    console.log('✅ Password đã được cập nhật!');
    console.log('');
    console.log('🔐 Thông tin đăng nhập mới:');
    console.log('   Username: admin');
    console.log('   Password: admin123');

    await pool.end();
}

updatePassword().catch(console.error);
