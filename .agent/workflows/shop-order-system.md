---
description: Hệ thống Mua hàng & Đặt hàng Online - CLB Bóng Bàn Lê Quý Đôn
---

# 🛒 HỆ THỐNG MUA HÀNG & ĐẶT HÀNG ONLINE

## 1️⃣ SƠ ĐỒ LUỒNG ĐẶT HÀNG

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LUỒNG ĐẶT HÀNG                              │
└─────────────────────────────────────────────────────────────────────┘

[Khách hàng]
     │
     ▼
┌──────────────┐
│ Xem sản phẩm │
│ (Danh mục)   │
└──────────────┘
     │
     ▼
┌──────────────┐
│ Chi tiết SP  │
│ + Chọn SL    │
└──────────────┘
     │
     ▼
┌──────────────────────────────┐
│ Nhập thông tin đặt hàng      │
│ • Họ tên                     │
│ • Số điện thoại              │
│ • Ghi chú (tuỳ chọn)         │
│ • Chọn: QR Code / Banking    │
└──────────────────────────────┘
     │
     ▼
┌──────────────────────────────┐
│ API: POST /shop/orders       │
│ → Tạo đơn + Mã đơn hàng      │
│ → Tạo nội dung CK            │
└──────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────┐
│ Hiển thị TRANG THANH TOÁN                            │
│ ┌──────────────────────────────────────────────────┐ │
│ │ QR Code (VietQR)                                 │ │
│ │ Ngân hàng: ACB                                   │ │
│ │ STK: 6200167                                     │ │
│ │ Chủ TK: TU NHAN LUAN                             │ │
│ │ Nội dung: CLBLQD_ORD123456                       │ │
│ │ Số tiền: 1,300,000 VNĐ                           │ │
│ ├──────────────────────────────────────────────────┤ │
│ │ Hotline: 0937 009 075                            │ │
│ │ Trạng thái: CHỜ THANH TOÁN                       │ │
│ └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
     │
     ├─── Khách chuyển khoản ───┐
     │                          │
     ▼                          ▼
[Admin kiểm tra]          [Tra cứu đơn hàng]
     │                          │
     ▼                          │
┌──────────────┐               │
│ Xác nhận     │               │
│ đã nhận tiền │               │
└──────────────┘               │
     │                          │
     ▼                          │
┌──────────────┐               │
│ Cập nhật     │◄──────────────┘
│ Trạng thái   │
│ → Đã TT      │
│ → Đã xác nhận│
│ → Hoàn tất   │
└──────────────┘
```

## 2️⃣ DATABASE SCHEMA

```sql
-- =====================================================
-- BẢNG PRODUCTS (Sản phẩm)
-- =====================================================
CREATE TABLE shop_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    brand VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    -- 'mat-vot', 'cot-vot', 'vot-hoan-chinh', 'bong', 'phu-kien'
    price INTEGER NOT NULL,           -- VNĐ
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

-- Index cho tìm kiếm
CREATE INDEX idx_shop_products_category ON shop_products(category);
CREATE INDEX idx_shop_products_brand ON shop_products(brand);
CREATE INDEX idx_shop_products_active ON shop_products(is_active);
CREATE INDEX idx_shop_products_slug ON shop_products(slug);

-- =====================================================
-- BẢNG SHOP_ORDERS (Đơn hàng)
-- =====================================================
CREATE TABLE shop_orders (
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
    
    -- Ghi chú admin
    admin_note TEXT,
    confirmed_by UUID REFERENCES admins(id),
    confirmed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_shop_orders_code ON shop_orders(order_code);
CREATE INDEX idx_shop_orders_phone ON shop_orders(customer_phone);
CREATE INDEX idx_shop_orders_status ON shop_orders(order_status);
CREATE INDEX idx_shop_orders_payment ON shop_orders(payment_status);
CREATE INDEX idx_shop_orders_created ON shop_orders(created_at DESC);

-- =====================================================
-- BẢNG ORDER_ITEMS (Chi tiết đơn hàng)
-- =====================================================
CREATE TABLE shop_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES shop_products(id),
    
    -- Lưu snapshot thông tin sản phẩm tại thời điểm đặt
    product_name VARCHAR(255) NOT NULL,
    product_brand VARCHAR(100),
    product_price INTEGER NOT NULL,   -- Giá tại thời điểm đặt
    
    quantity INTEGER NOT NULL DEFAULT 1,
    subtotal INTEGER NOT NULL,        -- price * quantity
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_shop_order_items_order ON shop_order_items(order_id);
CREATE INDEX idx_shop_order_items_product ON shop_order_items(product_id);

-- =====================================================
-- BẢNG SHOP_PAYMENTS (Thông tin thanh toán)
-- =====================================================
CREATE TABLE shop_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
    
    -- Thông tin ngân hàng (lưu snapshot)
    bank_name VARCHAR(100) NOT NULL,
    bank_code VARCHAR(20) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_holder VARCHAR(100) NOT NULL,
    
    amount INTEGER NOT NULL,
    transfer_content VARCHAR(50) NOT NULL,
    
    -- Bằng chứng thanh toán (admin upload)
    proof_image_url VARCHAR(500),
    
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- 'pending', 'verified', 'rejected'
    
    verified_by UUID REFERENCES admins(id),
    verified_at TIMESTAMP,
    verified_note TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_shop_payments_order ON shop_payments(order_id);
CREATE INDEX idx_shop_payments_status ON shop_payments(status);

-- =====================================================
-- BẢNG BANK_ACCOUNTS (Tài khoản ngân hàng CLB)
-- =====================================================
CREATE TABLE shop_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_name VARCHAR(100) NOT NULL,
    bank_code VARCHAR(20) NOT NULL,   -- Mã ngân hàng cho VietQR
    account_number VARCHAR(50) NOT NULL,
    account_holder VARCHAR(100) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert tài khoản mặc định
INSERT INTO shop_bank_accounts (bank_name, bank_code, account_number, account_holder, is_primary, is_active)
VALUES ('MB Bank', 'MB', '0937009075', 'VAN HUYNH PHUONG HUY', true, true);
```

## 3️⃣ API ENDPOINTS

### Public APIs (Không cần auth)
```
GET    /api/shop/products              - Lấy danh sách sản phẩm
GET    /api/shop/products/:slug        - Chi tiết sản phẩm theo slug
GET    /api/shop/products/category/:cat - Lọc theo danh mục
POST   /api/shop/orders                - Tạo đơn hàng mới
GET    /api/shop/orders/:code          - Tra cứu đơn hàng (bằng mã + SDT)
GET    /api/shop/bank-info             - Lấy thông tin ngân hàng
GET    /api/shop/qr/:orderCode         - Sinh QR code cho đơn hàng
```

### Admin APIs (Cần auth)
```
GET    /api/shop/admin/stats           - Thống kê dashboard
GET    /api/shop/admin/orders          - Danh sách đơn hàng
GET    /api/shop/admin/orders/:id      - Chi tiết đơn hàng
PUT    /api/shop/admin/orders/:id/status - Cập nhật trạng thái
PUT    /api/shop/admin/orders/:id/confirm - Xác nhận thanh toán

GET    /api/shop/admin/products        - Danh sách sản phẩm (admin)
POST   /api/shop/admin/products        - Thêm sản phẩm
PUT    /api/shop/admin/products/:id    - Sửa sản phẩm
DELETE /api/shop/admin/products/:id    - Xoá/ẩn sản phẩm
```

## 4️⃣ LOGIC TẠO QR CODE (VietQR)

### VietQR API Format
```javascript
// URL Template:
// https://img.vietqr.io/image/{BANK_CODE}-{ACCOUNT_NO}-{TEMPLATE}.png
//   ?amount={AMOUNT}
//   &addInfo={TRANSFER_CONTENT}
//   &accountName={ACCOUNT_HOLDER}

const generateVietQR = (order) => {
  const bankCode = 'MB';
  const accountNo = '0937009075';
  const accountName = encodeURIComponent('VAN HUYNH PHUONG HUY');
  const amount = order.total_amount;
  const transferContent = encodeURIComponent(`CLBLQD_${order.order_code}`);
  
  // Template: compact, compact2, qr_only, print
  const template = 'compact2';
  
  return `https://img.vietqr.io/image/${bankCode}-${accountNo}-${template}.png?amount=${amount}&addInfo=${transferContent}&accountName=${accountName}`;
};
```

### Order Code Generation
```javascript
const generateOrderCode = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${dateStr}${randomChars}`;
  // Example: 20231218ABCD
};
```

## 5️⃣ BEST PRACTICES - TRÁNH SAI PHẠM THANH TOÁN

### ✅ AN TOÀN & HỢP PHÁP
1. **Không giữ tiền người dùng** - Tiền chuyển trực tiếp vào tài khoản CLB
2. **Không sử dụng ví trung gian** - Không Momo, ZaloPay, Stripe
3. **Chỉ hiển thị thông tin chuyển khoản** - Không xử lý thanh toán tự động
4. **Xác nhận thủ công** - Admin kiểm tra sao kê trước khi confirm

### ⚠️ LƯU Ý
1. **Nội dung chuyển khoản PHẢI ĐÚNG** - `CLBLQD_[order_code]`
2. **Số tiền PHẢI CHÍNH XÁC** - Không làm tròn
3. **Hotline liên hệ** - Hiển thị rõ ràng nếu khách cần hỗ trợ
4. **Thời hạn thanh toán** - Đơn hàng có thể bị huỷ sau 24h nếu chưa thanh toán

### 🔒 BẢO MẬT
1. **Hash hoặc giấu số điện thoại** khi tra cứu
2. **Rate limiting** cho API tạo đơn (chống spam)
3. **Validate phone format** (Việt Nam: 10 số, bắt đầu 0)
4. **Admin-only confirm** - Chỉ admin xác nhận thanh toán

## 6️⃣ CHECKLIST DEPLOY PRODUCTION

### Pre-Deploy
- [ ] Environment variables đã set đúng
- [ ] Database migrations đã chạy
- [ ] Thông tin ngân hàng đã cập nhật
- [ ] SSL/HTTPS enabled
- [ ] CORS configured đúng

### Post-Deploy
- [ ] Test tạo đơn hàng
- [ ] Test sinh QR code
- [ ] Test tra cứu đơn bằng mã + SĐT
- [ ] Test admin xác nhận thanh toán
- [ ] Test mobile responsive

### Monitoring
- [ ] Logs đơn hàng
- [ ] Alert khi có đơn mới
- [ ] Backup database hàng ngày
