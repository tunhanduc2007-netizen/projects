/**
 * Migration: Add shipping/address fields to shop_orders
 * CLB Bóng Bàn Lê Quý Đôn
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('render.com') ? { rejectUnauthorized: false } : false
});

async function migrate() {
    console.log('🚀 Starting migration: Add shipping/address fields...');

    try {
        // Add address fields
        await pool.query(`
            ALTER TABLE shop_orders 
            ADD COLUMN IF NOT EXISTS address_street VARCHAR(255),
            ADD COLUMN IF NOT EXISTS address_ward VARCHAR(100),
            ADD COLUMN IF NOT EXISTS address_district VARCHAR(100),
            ADD COLUMN IF NOT EXISTS address_city VARCHAR(100) DEFAULT 'TP. Hồ Chí Minh',
            ADD COLUMN IF NOT EXISTS shipping_fee INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS final_amount INTEGER,
            ADD COLUMN IF NOT EXISTS is_cod BOOLEAN DEFAULT false
        `);
        console.log('✅ Added address and shipping fields');

        // Update final_amount for existing orders (set = total_amount if null)
        await pool.query(`
            UPDATE shop_orders 
            SET final_amount = total_amount + COALESCE(shipping_fee, 0)
            WHERE final_amount IS NULL
        `);
        console.log('✅ Updated existing orders with final_amount');

        // Add index for COD orders
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_shop_orders_is_cod ON shop_orders(is_cod) WHERE is_cod = true
        `);
        console.log('✅ Added index for COD orders');

        console.log('\n🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

migrate().catch(console.error);
