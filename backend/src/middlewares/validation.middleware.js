/**
 * Request Validation Middleware
 * CLB Bóng Bàn Lê Quý Đôn
 */

const { validationResult } = require('express-validator');

/**
 * Handle validation errors from express-validator
 */
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Dữ liệu không hợp lệ',
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

    next();
};

module.exports = { handleValidation };
