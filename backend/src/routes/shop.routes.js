/**
 * Shop Routes - Public APIs
 * CLB Bóng Bàn Lê Quý Đôn
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const ShopController = require('../controllers/shop.controller');
const { handleValidation } = require('../middlewares/validation.middleware');

// ============================================
// PRODUCTS - PUBLIC
// ============================================

/**
 * GET /api/shop/products
 * Get all active products
 */
router.get('/products', [
    query('category').optional().isString(),
    query('brand').optional().isString(),
    query('recommended').optional().isIn(['true', 'false']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
    handleValidation
], ShopController.getProducts);

/**
 * GET /api/shop/products/:slug
 * Get product by slug
 */
router.get('/products/:slug', [
    param('slug').isString().notEmpty(),
    handleValidation
], ShopController.getProductBySlug);

/**
 * GET /api/shop/categories
 * Get all categories
 */
router.get('/categories', ShopController.getCategories);

/**
 * GET /api/shop/brands
 * Get all brands
 */
router.get('/brands', ShopController.getBrands);

// ============================================
// ORDERS - PUBLIC
// ============================================

/**
 * POST /api/shop/orders
 * Create new order - with address and shipping support
 */
router.post('/orders', [
    body('customer_name')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập họ tên')
        .isLength({ min: 2, max: 100 }).withMessage('Họ tên từ 2-100 ký tự'),
    body('customer_phone')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập số điện thoại')
        .matches(/^(0[1-9])[0-9]{8}$/).withMessage('Số điện thoại không hợp lệ (VD: 0912345678)'),
    body('customer_note')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Ghi chú tối đa 500 ký tự'),
    // Address fields - OPTIONAL for backward compatibility
    body('address_street')
        .optional()
        .trim(),
    body('address_ward')
        .optional()
        .trim(),
    body('address_district')
        .optional()
        .trim(),
    body('address_city')
        .optional()
        .trim()
        .default('TP. Hồ Chí Minh'),
    // Payment method - now supports COD
    body('payment_method')
        .optional()
        .isIn(['qr', 'bank', 'cod']).withMessage('Phương thức thanh toán không hợp lệ'),
    body('items')
        .isArray({ min: 1 }).withMessage('Vui lòng chọn ít nhất 1 sản phẩm'),
    body('items.*.product_name')
        .notEmpty().withMessage('Tên sản phẩm không được trống'),
    body('items.*.price')
        .isInt({ min: 1000 }).withMessage('Giá sản phẩm phải >= 1.000đ'),
    body('items.*.quantity')
        .isInt({ min: 1, max: 99 }).withMessage('Số lượng từ 1-99'),
    handleValidation
], ShopController.createOrder);

/**
 * POST /api/shop/calculate-shipping
 * Calculate shipping fee preview
 */
router.post('/calculate-shipping', [
    body('total_amount')
        .isInt({ min: 1000 }).withMessage('Tổng tiền không hợp lệ'),
    body('district')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập Quận/Huyện'),
    body('city')
        .optional()
        .trim(),
    handleValidation
], ShopController.calculateShipping);

/**
 * GET /api/shop/orders/lookup
 * Lookup order by code and phone
 */
router.get('/orders/lookup', [
    query('code')
        .notEmpty().withMessage('Vui lòng nhập mã đơn hàng')
        .isLength({ min: 8, max: 20 }).withMessage('Mã đơn hàng không hợp lệ'),
    query('phone')
        .notEmpty().withMessage('Vui lòng nhập số điện thoại')
        .matches(/^(0[1-9])[0-9]{8}$/).withMessage('Số điện thoại không hợp lệ'),
    handleValidation
], ShopController.lookupOrder);

/**
 * GET /api/shop/bank-info
 * Get bank account info
 */
router.get('/bank-info', ShopController.getBankInfo);

/**
 * GET /api/shop/qr/:orderCode
 * Get QR code for order
 */
router.get('/qr/:orderCode', [
    param('orderCode').notEmpty(),
    query('phone').notEmpty().withMessage('Vui lòng cung cấp số điện thoại'),
    handleValidation
], ShopController.getQRCode);

module.exports = router;
