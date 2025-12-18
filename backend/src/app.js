/**
 * Express Application Configuration
 * CLB Bóng Bàn Lê Quý Đôn
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth.routes');
const memberRoutes = require('./routes/member.routes');
const coachRoutes = require('./routes/coach.routes');
const scheduleRoutes = require('./routes/schedule.routes');
const paymentRoutes = require('./routes/payment.routes');
const eventRoutes = require('./routes/event.routes');
const galleryRoutes = require('./routes/gallery.routes');
const contactRoutes = require('./routes/contact.routes');
const orderRoutes = require('./routes/order.routes');
const systemLogRoutes = require('./routes/systemLog.routes');
const shopRoutes = require('./routes/shop.routes');
const shopAdminRoutes = require('./routes/shopAdmin.routes');

const app = express();

// =====================================================
// SECURITY MIDDLEWARE
// =====================================================

// Helmet for security headers
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: true, // Allow any origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Quá nhiều yêu cầu, vui lòng thử lại sau.' }
});
app.use('/api/', limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau 15 phút.' }
});
app.use('/api/auth/login', authLimiter);

// =====================================================
// BODY PARSING & LOGGING
// =====================================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

// =====================================================
// API ROUTES
// =====================================================

app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/logs', systemLogRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/shop/admin', shopAdminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'CLB Bóng Bàn Lê Quý Đôn API is running',
        timestamp: new Date().toISOString()
    });
});

// =====================================================
// ERROR HANDLING
// =====================================================

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'Không tìm thấy API endpoint',
        path: req.originalUrl
    });
});

// Global error handler
app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message}`, { stack: err.stack });

    // Don't expose internal errors in production
    const isDevelopment = process.env.NODE_ENV === 'development';

    res.status(err.status || 500).json({
        success: false,
        error: isDevelopment ? err.message : 'Đã xảy ra lỗi server',
        ...(isDevelopment && { stack: err.stack })
    });
});

module.exports = app;
