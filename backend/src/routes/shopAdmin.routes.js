/**
 * Shop Admin Routes - Protected APIs
 * CLB Bóng Bàn Lê Quý Đôn
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const ShopAdminController = require('../controllers/shopAdmin.controller');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware');
const { handleValidation } = require('../middlewares/validation.middleware');

// All admin routes require authentication
router.use(authenticateToken);
router.use(requireAdmin);

// ============================================
// DASHBOARD
// ============================================

/**
 * GET /api/shop/admin/stats
 * Get dashboard statistics
 */
router.get('/stats', ShopAdminController.getStats);

// ============================================
// ORDERS MANAGEMENT
// ============================================

/**
 * GET /api/shop/admin/orders
 * Get all orders
 */
router.get('/orders', [
    query('payment_status').optional().isIn(['pending', 'paid', 'confirmed']),
    query('order_status').optional().isIn(['new', 'processing', 'done', 'cancelled']),
    query('search').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 200 }),
    query('offset').optional().isInt({ min: 0 }),
    handleValidation
], ShopAdminController.getOrders);

/**
 * GET /api/shop/admin/orders/:id
 * Get order detail
 */
router.get('/orders/:id', [
    param('id').isUUID().withMessage('ID đơn hàng không hợp lệ'),
    handleValidation
], ShopAdminController.getOrderById);

/**
 * PUT /api/shop/admin/orders/:id/status
 * Update order status
 */
router.put('/orders/:id/status', [
    param('id').isUUID().withMessage('ID đơn hàng không hợp lệ'),
    body('order_status')
        .notEmpty().withMessage('Trạng thái không được trống')
        .isIn(['new', 'processing', 'done', 'cancelled']).withMessage('Trạng thái không hợp lệ'),
    handleValidation
], ShopAdminController.updateOrderStatus);

/**
 * PUT /api/shop/admin/orders/:id/confirm
 * Confirm payment
 */
router.put('/orders/:id/confirm', [
    param('id').isUUID().withMessage('ID đơn hàng không hợp lệ'),
    body('note').optional().isString().isLength({ max: 500 }),
    handleValidation
], ShopAdminController.confirmPayment);

/**
 * PUT /api/shop/admin/orders/:id/note
 * Update admin note
 */
router.put('/orders/:id/note', [
    param('id').isUUID().withMessage('ID đơn hàng không hợp lệ'),
    body('note').optional().isString().isLength({ max: 1000 }),
    handleValidation
], ShopAdminController.updateOrderNote);

// ============================================
// PRODUCTS MANAGEMENT
// ============================================

/**
 * GET /api/shop/admin/products
 * Get all products (including inactive)
 */
router.get('/products', [
    query('category').optional().isString(),
    query('brand').optional().isString(),
    query('is_active').optional().isIn(['true', 'false']),
    query('limit').optional().isInt({ min: 1, max: 500 }),
    query('offset').optional().isInt({ min: 0 }),
    handleValidation
], ShopAdminController.getProducts);

/**
 * GET /api/shop/admin/products/:id
 * Get product by ID
 */
router.get('/products/:id', [
    param('id').isUUID().withMessage('ID sản phẩm không hợp lệ'),
    handleValidation
], ShopAdminController.getProductById);

/**
 * POST /api/shop/admin/products
 * Create new product
 */
router.post('/products', [
    body('name')
        .trim()
        .notEmpty().withMessage('Tên sản phẩm không được trống')
        .isLength({ min: 2, max: 255 }).withMessage('Tên từ 2-255 ký tự'),
    body('category')
        .notEmpty().withMessage('Danh mục không được trống')
        .isIn(['mat-vot', 'cot-vot', 'vot-hoan-chinh', 'bong', 'phu-kien'])
        .withMessage('Danh mục không hợp lệ'),
    body('price')
        .notEmpty().withMessage('Giá không được trống')
        .isInt({ min: 1000 }).withMessage('Giá phải >= 1.000đ'),
    body('brand').optional().isString().isLength({ max: 100 }),
    body('stock').optional().isInt({ min: 0 }),
    body('description').optional().isString(),
    body('is_recommended').optional().isBoolean(),
    body('is_active').optional().isBoolean(),
    body('availability').optional().isIn(['in-stock', 'pre-order', 'out-of-stock']),
    handleValidation
], ShopAdminController.createProduct);

/**
 * PUT /api/shop/admin/products/:id
 * Update product
 */
router.put('/products/:id', [
    param('id').isUUID().withMessage('ID sản phẩm không hợp lệ'),
    body('name').optional().trim().isLength({ min: 2, max: 255 }),
    body('category').optional().isIn(['mat-vot', 'cot-vot', 'vot-hoan-chinh', 'bong', 'phu-kien']),
    body('price').optional().isInt({ min: 1000 }),
    body('brand').optional().isString().isLength({ max: 100 }),
    body('stock').optional().isInt({ min: 0 }),
    body('is_recommended').optional().isBoolean(),
    body('is_active').optional().isBoolean(),
    body('availability').optional().isIn(['in-stock', 'pre-order', 'out-of-stock']),
    handleValidation
], ShopAdminController.updateProduct);

/**
 * DELETE /api/shop/admin/products/:id
 * Delete product (soft by default)
 */
router.delete('/products/:id', [
    param('id').isUUID().withMessage('ID sản phẩm không hợp lệ'),
    query('hard').optional().isIn(['true', 'false']),
    handleValidation
], ShopAdminController.deleteProduct);

/**
 * PUT /api/shop/admin/products/:id/stock
 * Update product stock
 */
router.put('/products/:id/stock', [
    param('id').isUUID().withMessage('ID sản phẩm không hợp lệ'),
    body('quantity')
        .notEmpty().withMessage('Số lượng không được trống')
        .isInt().withMessage('Số lượng phải là số nguyên'),
    handleValidation
], ShopAdminController.updateStock);

module.exports = router;
