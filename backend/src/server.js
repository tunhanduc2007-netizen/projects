/**
 * Server Entry Point
 * CLB Bóng Bàn Lê Quý Đôn
 */

require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');
const { pool } = require('./config/database');
const autoMigrate = require('./utils/autoMigrate');

const PORT = process.env.PORT || 3001;

// Test database connection before starting server
async function startServer() {
    try {
        // Test database connection
        const result = await pool.query('SELECT NOW()');
        logger.info(`Database connected: ${result.rows[0].now}`);

        // Run auto-migration BEFORE starting server
        logger.info('Running auto-migration...');
        await autoMigrate();
        logger.info('Auto-migration complete');

        // Start server
        app.listen(PORT, () => {
            logger.info(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏓 CLB BÓNG BÀN LÊ QUÝ ĐÔN - API SERVER                ║
║                                                           ║
║   Server running on: http://localhost:${PORT}              ║
║   Environment: ${process.env.NODE_ENV || 'development'}                           ║
║   Database: PostgreSQL                                    ║
║                                                           ║
║   API Endpoints:                                          ║
║   - GET  /api/health      - Health check                  ║
║   - POST /api/auth/login  - Admin login                   ║
║   - GET  /api/members     - List members                  ║
║   - GET  /api/coaches     - List coaches                  ║
║   - GET  /api/schedule    - Training schedule             ║
║   - GET  /api/events      - Events list                   ║
║   - GET  /api/gallery     - Gallery images                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
            `);
        });

    } catch (error) {
        logger.error('Failed to connect to database:', error.message);
        logger.error('Make sure PostgreSQL is running and credentials are correct.');
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    await pool.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received. Shutting down gracefully...');
    await pool.end();
    process.exit(0);
});

startServer();
