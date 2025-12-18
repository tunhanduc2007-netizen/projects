/**
 * Auto Migration - Runs on Server Start
 * CLB Bóng Bàn Lê Quý Đôn
 * 
 * Checks and adds missing columns to shop_orders table
 * Safe to run multiple times - only adds columns if they don't exist
 */

const { query } = require('../config/database');

const REQUIRED_COLUMNS = [
    { name: 'address_street', type: 'VARCHAR(255)', default: null },
    { name: 'address_ward', type: 'VARCHAR(100)', default: null },
    { name: 'address_district', type: 'VARCHAR(100)', default: null },
    { name: 'address_city', type: "VARCHAR(100) DEFAULT 'TP. Hồ Chí Minh'", default: null },
    { name: 'shipping_fee', type: 'INTEGER DEFAULT 0', default: null },
    { name: 'final_amount', type: 'INTEGER', default: null },
    { name: 'is_cod', type: 'BOOLEAN DEFAULT false', default: null }
];

async function checkColumnExists(tableName, columnName) {
    const sql = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = $2
    `;
    const result = await query(sql, [tableName, columnName]);
    return result.rows.length > 0;
}

async function addColumn(tableName, columnName, columnType) {
    const sql = `ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${columnName} ${columnType}`;
    await query(sql);
}

async function autoMigrate() {
    console.log('[AUTO-MIGRATE] Starting migration check for shop_orders...');

    try {
        let created = 0;
        let existing = 0;

        for (const col of REQUIRED_COLUMNS) {
            const exists = await checkColumnExists('shop_orders', col.name);

            if (exists) {
                console.log(`[AUTO-MIGRATE] ${col.name}: exists ✓`);
                existing++;
            } else {
                await addColumn('shop_orders', col.name, col.type);
                console.log(`[AUTO-MIGRATE] ${col.name}: CREATED ✔`);
                created++;
            }
        }

        // Update final_amount for existing orders if null
        if (created > 0) {
            await query(`
                UPDATE shop_orders 
                SET final_amount = total_amount + COALESCE(shipping_fee, 0)
                WHERE final_amount IS NULL
            `);
            console.log('[AUTO-MIGRATE] Updated existing orders with final_amount');
        }

        console.log(`[AUTO-MIGRATE] Complete: ${created} created, ${existing} already exist`);
        return true;

    } catch (error) {
        console.error('[AUTO-MIGRATE] ERROR:', error.message);
        // Don't crash the server, just log the error
        return false;
    }
}

module.exports = autoMigrate;
