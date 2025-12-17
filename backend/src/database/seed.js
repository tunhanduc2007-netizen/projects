/**
 * Database Seed Script
 * CLB Bóng Bàn Lê Quý Đôn
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'clb_bongban_lqd',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
    };

const pool = new Pool(poolConfig);

async function seed() {
    console.log('🌱 Starting database seeding...');

    try {
        // Generate password hash for admin
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@LQD2024';
        const passwordHash = await bcrypt.hash(adminPassword, 10);

        // Read seed file and replace password placeholder
        const seedPath = path.join(__dirname, 'seed.sql');
        let seedSql = fs.readFileSync(seedPath, 'utf8');

        // Replace the placeholder hash with real hash
        seedSql = seedSql.replace(/\$2a\$10\$8K1p\/a0dL1LXMIgoEDFrwOXCxFqH1tPKS5GQJ5PL5KQK2KJQ2KQKQ/g, passwordHash);

        // Execute seed
        await pool.query(seedSql);

        console.log('✅ Database seeded successfully!');
        console.log('📋 Data inserted:');
        console.log('   - 2 admin accounts');
        console.log('   - 4 coaches');
        console.log('   - 26 training sessions');
        console.log('   - 5 members');
        console.log('   - 5 payment records');
        console.log('   - 2 events');
        console.log('   - 5 gallery images');
        console.log('   - 2 contact forms');
        console.log('');
        console.log('🔐 Admin Login:');
        console.log(`   Username: admin`);
        console.log(`   Password: ${adminPassword}`);

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

seed();
