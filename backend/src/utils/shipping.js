/**
 * Shipping Constants & Logic
 * CLB Bóng Bàn Lê Quý Đôn
 */

// Phí ship mặc định
const SHIPPING_FEE = 30000; // 30.000đ

// Ngưỡng miễn phí ship
const FREE_SHIPPING_THRESHOLD = 500000; // 500.000đ

// Danh sách quận nội thành TP.HCM (hỗ trợ COD và tính phí ship)
const HCMC_INNER_DISTRICTS = [
    'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5',
    'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10',
    'Quận 11', 'Quận 12', 'Bình Thạnh', 'Gò Vấp', 'Phú Nhuận',
    'Tân Bình', 'Tân Phú', 'Bình Tân', 'Thủ Đức',
    // Các tên viết tắt/thay thế
    'Q.1', 'Q.2', 'Q.3', 'Q.4', 'Q.5', 'Q.6', 'Q.7', 'Q.8', 'Q.9', 'Q.10',
    'Q.11', 'Q.12', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10',
    'Q11', 'Q12', 'TP. Thủ Đức', 'Thành phố Thủ Đức'
];

/**
 * Check if district is in HCMC inner city
 */
function isInnerCity(district, city = 'TP. Hồ Chí Minh') {
    if (!district) return false;

    // Chỉ áp dụng cho TP.HCM
    const hcmCities = ['TP. Hồ Chí Minh', 'Hồ Chí Minh', 'HCM', 'TPHCM', 'TP.HCM', 'Ho Chi Minh'];
    const isHCM = hcmCities.some(c => city.toLowerCase().includes(c.toLowerCase()));

    if (!isHCM) return false;

    // Normalize district name
    const normalizedDistrict = district.trim().toLowerCase();

    return HCMC_INNER_DISTRICTS.some(d =>
        normalizedDistrict === d.toLowerCase() ||
        normalizedDistrict.includes(d.toLowerCase()) ||
        d.toLowerCase().includes(normalizedDistrict)
    );
}

/**
 * Calculate shipping fee
 * @param {number} totalAmount - Tổng tiền sản phẩm (chưa ship)
 * @param {string} district - Quận/Huyện
 * @param {string} city - Thành phố
 * @returns {{ shippingFee: number, isFreeShipping: boolean, reason: string }}
 */
function calculateShippingFee(totalAmount, district, city = 'TP. Hồ Chí Minh') {
    // Nếu >= 500k → miễn phí
    if (totalAmount >= FREE_SHIPPING_THRESHOLD) {
        return {
            shippingFee: 0,
            isFreeShipping: true,
            reason: `Miễn phí ship đơn từ ${FREE_SHIPPING_THRESHOLD.toLocaleString('vi-VN')}₫`
        };
    }

    // Nếu nội thành TP.HCM → phí 30k
    if (isInnerCity(district, city)) {
        return {
            shippingFee: SHIPPING_FEE,
            isFreeShipping: false,
            reason: `Phí giao hàng nội thành`
        };
    }

    // Ngoại thành - không hỗ trợ hiện tại
    return {
        shippingFee: 0,
        isFreeShipping: false,
        reason: 'Liên hệ để biết phí ship'
    };
}

/**
 * Check if COD is available for address
 */
function isCodAvailable(district, city = 'TP. Hồ Chí Minh') {
    return isInnerCity(district, city);
}

module.exports = {
    SHIPPING_FEE,
    FREE_SHIPPING_THRESHOLD,
    HCMC_INNER_DISTRICTS,
    isInnerCity,
    calculateShippingFee,
    isCodAvailable
};
