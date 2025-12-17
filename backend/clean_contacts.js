const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function clean() {
    try {
        console.log('Connecting to database...');

        // Delete fake contacts from seed
        console.log('Deleting fake contacts (Nguyễn Minh Tuấn, Trần Thị Lan)...');
        const resContacts = await pool.query("DELETE FROM contact_forms WHERE name IN ('Nguyễn Minh Tuấn', 'Trần Thị Lan')");
        console.log(`Deleted ${resContacts.rowCount} contacts.`);

        // Check if orders table exists and delete fake orders if any (mock orders usually not in DB unless I added them)
        // I won't touch orders unless requested, to avoid deleting real tests.

        console.log('Cleanup complete.');
        process.exit(0);
    } catch (e) {
        console.error('Error during cleanup:', e);
        process.exit(1);
    }
}

clean();
