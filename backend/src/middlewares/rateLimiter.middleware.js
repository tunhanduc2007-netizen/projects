/**
 * Rate Limiter Middleware
 * Chống spam đơn hàng theo IP
 * CLB Bóng Bàn Lê Quý Đôn
 */

const logger = require('../utils/logger');

// In-memory store cho rate limiting (production nên dùng Redis)
const ipOrderStore = new Map();
const ipRequestStore = new Map();

// Config
const ORDER_LIMIT_PER_HOUR = 5;     // Tối đa 5 đơn/giờ/IP
const REQUEST_LIMIT_PER_MIN = 30;   // Tối đa 30 request/phút/IP
const CLEANUP_INTERVAL = 60 * 1000; // Dọn dẹp mỗi phút

/**
 * Middleware: Giới hạn số đơn hàng theo IP
 * Sử dụng cho POST /api/shop/orders
 */
const orderRateLimiter = (req, res, next) => {
    const clientIp = getClientIp(req);
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    // Lấy danh sách đơn hàng đã tạo từ IP này
    let orders = ipOrderStore.get(clientIp) || [];

    // Lọc chỉ giữ đơn trong 1 giờ qua
    orders = orders.filter(timestamp => timestamp > oneHourAgo);

    // Kiểm tra đã vượt limit chưa
    if (orders.length >= ORDER_LIMIT_PER_HOUR) {
        logger.warn(`Rate limit exceeded for IP: ${clientIp}, orders in hour: ${orders.length}`);
        return res.status(429).json({
            success: false,
            error: 'Bạn đã đặt quá nhiều đơn hàng. Vui lòng thử lại sau 1 giờ.',
            retryAfter: Math.ceil((orders[0] + 60 * 60 * 1000 - now) / 1000) // seconds
        });
    }

    // Thêm timestamp đơn mới
    orders.push(now);
    ipOrderStore.set(clientIp, orders);

    // Log để debug
    logger.debug(`IP ${clientIp}: ${orders.length}/${ORDER_LIMIT_PER_HOUR} orders in last hour`);

    next();
};

/**
 * Middleware: Giới hạn request chung theo IP
 * Sử dụng cho tất cả API
 */
const requestRateLimiter = (req, res, next) => {
    const clientIp = getClientIp(req);
    const now = Date.now();
    const oneMinuteAgo = now - (60 * 1000);

    // Lấy danh sách request từ IP này
    let requests = ipRequestStore.get(clientIp) || [];

    // Lọc chỉ giữ request trong 1 phút qua
    requests = requests.filter(timestamp => timestamp > oneMinuteAgo);

    // Kiểm tra đã vượt limit chưa
    if (requests.length >= REQUEST_LIMIT_PER_MIN) {
        logger.warn(`Request rate limit exceeded for IP: ${clientIp}`);
        return res.status(429).json({
            success: false,
            error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
            retryAfter: 60
        });
    }

    // Thêm timestamp request mới
    requests.push(now);
    ipRequestStore.set(clientIp, requests);

    next();
};

/**
 * Lấy IP thực của client (xử lý proxy)
 */
const getClientIp = (req) => {
    // Các header thường dùng cho proxy/load balancer
    const forwardedFor = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const cfConnectingIp = req.headers['cf-connecting-ip']; // Cloudflare

    if (cfConnectingIp) return cfConnectingIp;
    if (realIp) return realIp;
    if (forwardedFor) return forwardedFor.split(',')[0].trim();

    return req.connection?.remoteAddress || req.ip || 'unknown';
};

/**
 * Dọn dẹp dữ liệu cũ định kỳ
 */
const cleanupExpiredData = () => {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneMinuteAgo = now - (60 * 1000);

    // Dọn order store
    for (const [ip, orders] of ipOrderStore.entries()) {
        const validOrders = orders.filter(t => t > oneHourAgo);
        if (validOrders.length === 0) {
            ipOrderStore.delete(ip);
        } else {
            ipOrderStore.set(ip, validOrders);
        }
    }

    // Dọn request store
    for (const [ip, requests] of ipRequestStore.entries()) {
        const validRequests = requests.filter(t => t > oneMinuteAgo);
        if (validRequests.length === 0) {
            ipRequestStore.delete(ip);
        } else {
            ipRequestStore.set(ip, validRequests);
        }
    }
};

// Start cleanup interval
setInterval(cleanupExpiredData, CLEANUP_INTERVAL);

module.exports = {
    orderRateLimiter,
    requestRateLimiter,
    getClientIp
};
