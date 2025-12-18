/**
 * Check shop_orders in database
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkOrders() {
    try {
        console.log('Connecting to database...');
        console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');

        const result = await pool.query('SELECT * FROM shop_orders ORDER BY created_at DESC');

        console.log('\n=== SHOP ORDERS ===');
        console.log(`Total orders: ${result.rows.length}`);

        if (result.rows.length > 0) {
            result.rows.forEach((order, index) => {
                console.log(`\n${index + 1}. Order Code: ${order.order_code}`);
                console.log(`   Customer: ${order.customer_name} - ${order.customer_phone}`);
                console.log(`   Amount: ${order.total_amount?.toLocaleString()}đ`);
                console.log(`   Status: ${order.order_status} | Payment: ${order.payment_status}`);
                console.log(`   Created: ${order.created_at}`);
            });
        } else {
            console.log('No orders found in database!');
        }

        // Also check if table exists
        const tables = await pool.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name LIKE 'shop_%'
        `);
        console.log('\n=== SHOP TABLES ===');
        tables.rows.forEach(t => console.log(`- ${t.table_name}`));

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkOrders();
