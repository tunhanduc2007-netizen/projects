-- =====================================================
-- MIGRATION: Chuẩn bị cho User System (Tương lai)
-- CLB Bóng Bàn Lê Quý Đôn
-- Created: 2024-12-19
-- =====================================================

-- =====================================================
-- 1. THÊM CỘT user_id VÀO shop_orders (nullable cho guest checkout)
-- Sau này khi thêm bảng users, chỉ cần:
--   1. Tạo bảng users
--   2. Thêm FOREIGN KEY constraint
-- =====================================================
ALTER TABLE shop_orders 
ADD COLUMN IF NOT EXISTS user_id UUID NULL;

-- Index cho user_id (dùng sau này khi có user system)
CREATE INDEX IF NOT EXISTS idx_shop_orders_user ON shop_orders(user_id) WHERE user_id IS NOT NULL;

-- Comment giải thích
COMMENT ON COLUMN shop_orders.user_id IS 'ID của user (NULL = guest checkout). Sẽ thêm FK sau khi có bảng users.';

-- =====================================================
-- 2. THÊM CỘT client_ip ĐỂ TRACKING/ANTI-SPAM
-- =====================================================
ALTER TABLE shop_orders
ADD COLUMN IF NOT EXISTS client_ip VARCHAR(45) NULL;

-- Comment
COMMENT ON COLUMN shop_orders.client_ip IS 'IP address của khách hàng khi đặt đơn (cho anti-spam)';

-- =====================================================
-- 3. TEMPLATE CHO BẢNG USERS (TƯƠNG LAI)
-- Uncomment và chạy khi muốn thêm user system
-- =====================================================
/*
-- Bảng users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,       -- SĐT là định danh chính
    email VARCHAR(255) UNIQUE,                -- Email tuỳ chọn
    password_hash VARCHAR(255),               -- NULL nếu dùng OTP
    full_name VARCHAR(100) NOT NULL,
    
    -- Thông tin bổ sung
    default_address_street VARCHAR(255),
    default_address_ward VARCHAR(100),
    default_address_district VARCHAR(100),
    default_address_city VARCHAR(100) DEFAULT 'TP. Hồ Chí Minh',
    
    -- Trạng thái
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    
    -- Timestamps
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;

-- Sau đó thêm FK vào orders:
-- ALTER TABLE shop_orders 
--     ADD CONSTRAINT fk_shop_orders_user 
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
*/

-- =====================================================
-- 4. VIEW: Lịch sử đơn hàng theo SĐT (cho guest)
-- =====================================================
CREATE OR REPLACE VIEW shop_customer_orders AS
SELECT 
    o.customer_phone,
    COUNT(*) as total_orders,
    SUM(o.final_amount) FILTER (WHERE o.payment_status = 'confirmed') as total_spent,
    MAX(o.created_at) as last_order_at,
    json_agg(
        json_build_object(
            'order_code', o.order_code,
            'final_amount', o.final_amount,
            'order_status', o.order_status,
            'payment_status', o.payment_status,
            'created_at', o.created_at
        ) ORDER BY o.created_at DESC
    ) as orders
FROM shop_orders o
WHERE o.order_status != 'cancelled'
GROUP BY o.customer_phone;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'User system preparation migration completed!' as message;
