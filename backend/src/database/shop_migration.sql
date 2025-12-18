-- =====================================================
-- SHOP & ORDER SYSTEM - DATABASE MIGRATION
-- CLB Bóng Bàn Lê Quý Đôn
-- Created: 2024-12-18
-- =====================================================

-- =====================================================
-- 1. BẢNG SHOP_BANK_ACCOUNTS (Tài khoản ngân hàng CLB)
-- =====================================================
CREATE TABLE IF NOT EXISTS shop_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_name VARCHAR(100) NOT NULL,
    bank_code VARCHAR(20) NOT NULL,   -- Mã ngân hàng cho VietQR (MB, VCB, TCB, ...)
    account_number VARCHAR(50) NOT NULL,
    account_holder VARCHAR(100) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert tài khoản mặc định (chỉ insert nếu chưa có)
INSERT INTO shop_bank_accounts (bank_name, bank_code, account_number, account_holder, is_primary, is_active)
SELECT 'ACB', 'ACB', '6200167', 'TU NHAN LUAN', true, true
WHERE NOT EXISTS (SELECT 1 FROM shop_bank_accounts WHERE is_primary = true);

-- =====================================================
-- 2. BẢNG SHOP_PRODUCTS (Sản phẩm)
-- =====================================================
CREATE TABLE IF NOT EXISTS shop_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    brand VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    -- Categories: 'mat-vot', 'cot-vot', 'vot-hoan-chinh', 'bong', 'phu-kien'
    
    price INTEGER NOT NULL,           -- Giá bán (VNĐ)
    original_price INTEGER,           -- Giá gốc (nếu có giảm giá)
    stock INTEGER DEFAULT 0,          -- Tồn kho (0 = pre-order)
    
    description TEXT,
    short_description VARCHAR(500),
    image_url VARCHAR(500),
    images JSONB DEFAULT '[]',        -- Array of image URLs
    specs JSONB DEFAULT '[]',         -- [{label: "Tốc độ", value: "13.0"}]
    suitable_for JSONB DEFAULT '[]',  -- Phù hợp cho ai
    coach_review TEXT,                -- Nhận xét của HLV
    
    is_recommended BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    availability VARCHAR(20) DEFAULT 'in-stock',
    -- 'in-stock', 'pre-order', 'out-of-stock'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes cho shop_products
CREATE INDEX IF NOT EXISTS idx_shop_products_category ON shop_products(category);
CREATE INDEX IF NOT EXISTS idx_shop_products_brand ON shop_products(brand);
CREATE INDEX IF NOT EXISTS idx_shop_products_active ON shop_products(is_active);
CREATE INDEX IF NOT EXISTS idx_shop_products_slug ON shop_products(slug);
CREATE INDEX IF NOT EXISTS idx_shop_products_recommended ON shop_products(is_recommended) WHERE is_recommended = true;

-- =====================================================
-- 3. BẢNG SHOP_ORDERS (Đơn hàng)
-- =====================================================
CREATE TABLE IF NOT EXISTS shop_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code VARCHAR(20) UNIQUE NOT NULL,
    -- Format: YYYYMMDD + 4 random chars, e.g., "20231218ABCD"
    
    -- Thông tin khách hàng
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_note TEXT,
    
    -- Thông tin thanh toán
    total_amount INTEGER NOT NULL,    -- Tổng tiền VNĐ
    payment_method VARCHAR(20) NOT NULL DEFAULT 'qr',
    -- 'qr' = QR VietQR, 'bank' = Chuyển khoản thủ công
    
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- 'pending' = Chờ thanh toán
    -- 'paid' = Đã thanh toán (khách claim)
    -- 'confirmed' = Đã xác nhận (admin confirm)
    
    -- Trạng thái đơn hàng
    order_status VARCHAR(20) NOT NULL DEFAULT 'new',
    -- 'new' = Mới tạo
    -- 'processing' = Đang xử lý
    -- 'done' = Hoàn tất
    -- 'cancelled' = Đã huỷ
    
    -- Nội dung chuyển khoản (tự động sinh)
    transfer_content VARCHAR(50) NOT NULL,
    -- Format: CLBLQD_[order_code]
    
    -- QR Code URL (cached)
    qr_code_url VARCHAR(500),
    
    -- Ghi chú admin
    admin_note TEXT,
    confirmed_by UUID,
    confirmed_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes cho shop_orders
CREATE INDEX IF NOT EXISTS idx_shop_orders_code ON shop_orders(order_code);
CREATE INDEX IF NOT EXISTS idx_shop_orders_phone ON shop_orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_shop_orders_order_status ON shop_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_shop_orders_payment_status ON shop_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_shop_orders_created ON shop_orders(created_at DESC);

-- =====================================================
-- 4. BẢNG SHOP_ORDER_ITEMS (Chi tiết đơn hàng)
-- =====================================================
CREATE TABLE IF NOT EXISTS shop_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES shop_products(id) ON DELETE SET NULL,
    
    -- Lưu snapshot thông tin sản phẩm tại thời điểm đặt
    product_name VARCHAR(255) NOT NULL,
    product_brand VARCHAR(100),
    product_price INTEGER NOT NULL,   -- Giá tại thời điểm đặt
    product_image VARCHAR(500),
    
    quantity INTEGER NOT NULL DEFAULT 1,
    subtotal INTEGER NOT NULL,        -- price * quantity
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes cho shop_order_items
CREATE INDEX IF NOT EXISTS idx_shop_order_items_order ON shop_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_shop_order_items_product ON shop_order_items(product_id);

-- =====================================================
-- 5. BẢNG SHOP_PAYMENTS (Thông tin thanh toán)
-- =====================================================
CREATE TABLE IF NOT EXISTS shop_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
    
    -- Thông tin ngân hàng (lưu snapshot tại thời điểm tạo)
    bank_name VARCHAR(100) NOT NULL,
    bank_code VARCHAR(20) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_holder VARCHAR(100) NOT NULL,
    
    amount INTEGER NOT NULL,
    transfer_content VARCHAR(50) NOT NULL,
    
    -- Bằng chứng thanh toán (admin upload)
    proof_image_url VARCHAR(500),
    
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- 'pending' = Chờ xác nhận
    -- 'verified' = Đã xác nhận
    -- 'rejected' = Từ chối
    
    verified_by UUID,
    verified_at TIMESTAMP,
    verified_note TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes cho shop_payments
CREATE INDEX IF NOT EXISTS idx_shop_payments_order ON shop_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_shop_payments_status ON shop_payments(status);

-- =====================================================
-- TRIGGERS: Auto-update updated_at
-- =====================================================

-- Function để update timestamp
CREATE OR REPLACE FUNCTION update_shop_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger cho shop_products
DROP TRIGGER IF EXISTS trigger_shop_products_updated ON shop_products;
CREATE TRIGGER trigger_shop_products_updated
    BEFORE UPDATE ON shop_products
    FOR EACH ROW
    EXECUTE FUNCTION update_shop_timestamp();

-- Trigger cho shop_orders
DROP TRIGGER IF EXISTS trigger_shop_orders_updated ON shop_orders;
CREATE TRIGGER trigger_shop_orders_updated
    BEFORE UPDATE ON shop_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_shop_timestamp();

-- Trigger cho shop_payments
DROP TRIGGER IF EXISTS trigger_shop_payments_updated ON shop_payments;
CREATE TRIGGER trigger_shop_payments_updated
    BEFORE UPDATE ON shop_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_shop_timestamp();

-- =====================================================
-- VIEWS: Thống kê nhanh
-- =====================================================

-- View: Thống kê đơn hàng theo ngày
CREATE OR REPLACE VIEW shop_orders_daily_stats AS
SELECT 
    DATE(created_at) as order_date,
    COUNT(*) as total_orders,
    COUNT(*) FILTER (WHERE payment_status = 'pending') as pending_orders,
    COUNT(*) FILTER (WHERE payment_status = 'confirmed') as confirmed_orders,
    SUM(total_amount) as total_revenue,
    SUM(total_amount) FILTER (WHERE payment_status = 'confirmed') as confirmed_revenue
FROM shop_orders
WHERE order_status != 'cancelled'
GROUP BY DATE(created_at)
ORDER BY order_date DESC;

-- View: Chi tiết đơn hàng đầy đủ
CREATE OR REPLACE VIEW shop_orders_full AS
SELECT 
    o.*,
    COALESCE(
        json_agg(
            json_build_object(
                'id', oi.id,
                'product_name', oi.product_name,
                'product_brand', oi.product_brand,
                'product_price', oi.product_price,
                'product_image', oi.product_image,
                'quantity', oi.quantity,
                'subtotal', oi.subtotal
            )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'
    ) as items
FROM shop_orders o
LEFT JOIN shop_order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'Shop & Order system migration completed successfully!' as message;
