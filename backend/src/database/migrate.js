/**
 * Database Migration Script
 * CLB Bóng Bàn Lê Quý Đôn
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'clb_bongban_lqd',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
});

async function migrate() {
    console.log('🚀 Starting database migration...');

    try {
        // Read schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Execute schema
        await pool.query(schema);

        console.log('✅ Database schema created successfully!');
        console.log('📋 Tables created:');
        console.log('   - admins');
        console.log('   - coaches');
        console.log('   - members');
        console.log('   - training_sessions');
        console.log('   - payments');
        console.log('   - events');
        console.log('   - gallery');
        console.log('   - contact_forms');
        console.log('   - attendance');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();
