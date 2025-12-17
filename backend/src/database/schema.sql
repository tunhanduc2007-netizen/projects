-- =====================================================
-- CLB BÓNG BÀN LÊ QUÝ ĐÔN - DATABASE SCHEMA
-- PostgreSQL Database
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ADMINS TABLE - Quản trị viên
-- =====================================================
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'staff')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- =====================================================
-- 2. COACHES TABLE - Huấn luyện viên
-- =====================================================
CREATE TABLE IF NOT EXISTS coaches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    experience_years INTEGER DEFAULT 0,
    bio TEXT,
    avatar_url VARCHAR(500),
    hourly_rate DECIMAL(10, 0) DEFAULT 250000, -- 250.000đ/giờ
    table_fee DECIMAL(10, 0) DEFAULT 50000,    -- 50.000đ/giờ thuê bàn
    rating DECIMAL(2, 1) DEFAULT 5.0,
    total_students INTEGER DEFAULT 0,
    badges TEXT[], -- Array: ['Kiện tướng', 'Chuyên nghiệp', 'Tận tâm']
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_coaches_status ON coaches(status);
CREATE INDEX IF NOT EXISTS idx_coaches_full_name ON coaches(full_name);

-- =====================================================
-- 3. MEMBERS TABLE - Học viên
-- =====================================================
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    date_of_birth DATE,
    address TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    payment_type VARCHAR(20) DEFAULT 'per_visit' CHECK (payment_type IN ('per_visit', 'monthly')),
    monthly_expiry DATE, -- Ngày hết hạn gói tháng
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    notes TEXT,
    referred_by UUID REFERENCES members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_members_phone ON members(phone);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_payment_type ON members(payment_type);
CREATE INDEX IF NOT EXISTS idx_members_join_date ON members(join_date);

-- =====================================================
-- 4. TRAINING_SESSIONS TABLE - Buổi tập / Lịch dạy HLV
-- =====================================================
CREATE TABLE IF NOT EXISTS training_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Thứ 2, 7=CN
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_students INTEGER DEFAULT 5,
    current_students INTEGER DEFAULT 0,
    session_type VARCHAR(30) DEFAULT 'private' CHECK (session_type IN ('private', 'group', 'free_practice')),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'full')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_sessions_coach ON training_sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_sessions_day ON training_sessions(day_of_week);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON training_sessions(status);

-- =====================================================
-- 5. PAYMENTS TABLE - Thu phí
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    amount DECIMAL(10, 0) NOT NULL,
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('per_visit', 'monthly', 'coach_fee', 'other')),
    payment_method VARCHAR(30) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'bank_transfer', 'momo', 'zalo_pay')),
    description TEXT,
    notes TEXT,
    receipt_number VARCHAR(50),
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    recorded_by UUID REFERENCES admins(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at);

-- =====================================================
-- 6. EVENTS TABLE - Giải đấu / Sự kiện
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(200) DEFAULT '3B Lê Quý Đôn, Phú Nhuận, TP.HCM',
    image_url VARCHAR(500),
    max_participants INTEGER,
    registration_fee DECIMAL(10, 0) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- =====================================================
-- 7. GALLERY TABLE - Hình ảnh CLB
-- =====================================================
CREATE TABLE IF NOT EXISTS gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200),
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'training', 'event', 'tournament', 'facility')),
    sort_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_gallery_sort ON gallery(sort_order);

-- =====================================================
-- 8. ORDERS TABLE - Đơn hàng Shop
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    product_price DECIMAL(10, 0) NOT NULL,
    quantity INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'pending', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

-- =====================================================
-- 9. CONTACT_FORMS TABLE - Form liên hệ
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    subject VARCHAR(100),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    replied_at TIMESTAMP WITH TIME ZONE,
    replied_by UUID REFERENCES admins(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_forms(status);
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_forms(created_at);

-- =====================================================
-- 9. ATTENDANCE TABLE - Điểm danh (optional)
-- =====================================================
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    session_id UUID REFERENCES training_sessions(id),
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(check_in_time);

-- =====================================================
-- UPDATE TIMESTAMP TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coaches_updated_at ON coaches;
CREATE TRIGGER update_coaches_updated_at BEFORE UPDATE ON coaches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON training_sessions;
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON training_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE admins IS 'Quản trị viên hệ thống';
COMMENT ON TABLE coaches IS 'Huấn luyện viên CLB';
COMMENT ON TABLE members IS 'Học viên / Thành viên CLB';
COMMENT ON TABLE training_sessions IS 'Lịch dạy của HLV theo tuần';
COMMENT ON TABLE payments IS 'Lịch sử thanh toán phí';
COMMENT ON TABLE events IS 'Giải đấu và sự kiện';
COMMENT ON TABLE gallery IS 'Thư viện hình ảnh CLB';
COMMENT ON TABLE contact_forms IS 'Form liên hệ từ website';
COMMENT ON TABLE attendance IS 'Điểm danh học viên';
