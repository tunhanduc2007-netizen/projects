-- =====================================================
-- CLB BÓNG BÀN LÊ QUÝ ĐÔN - SEED DATA THẬT
-- Dữ liệu thực tế cho CLB
-- =====================================================

-- =====================================================
-- 1. ADMIN - Tài khoản quản trị
-- Password: Admin@LQD2024 (bcrypt hash)
-- =====================================================
INSERT INTO admins (id, username, password_hash, email, full_name, role) VALUES
    ('a1000000-0000-0000-0000-000000000001'::uuid, 'admin', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOXCxFqH1tPKS5GQJ5PL5KQK2KJQ2KQKQ', 'tunhanluan1971@gmail.com', 'Admin CLB LQD', 'super_admin'),
    ('a1000000-0000-0000-0000-000000000002'::uuid, 'staff', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOXCxFqH1tPKS5GQJ5PL5KQK2KJQ2KQKQ', 'staff@clbbongbanlequydon.com', 'Nhân viên', 'staff');

-- =====================================================
-- 2. COACHES - Huấn luyện viên thật
-- =====================================================
INSERT INTO coaches (id, full_name, phone, experience_years, bio, avatar_url, hourly_rate, table_fee, rating, total_students, badges, status) VALUES
    (
        'c1000000-0000-0000-0000-000000000001'::uuid,
        'Võ Hoàng Nhựt Sơn',
        '0913909012',
        7,
        'HLV chuyên nghiệp với 7+ năm kinh nghiệm đào tạo. Từng đạt nhiều giải thưởng tại các giải đấu CLB TP.HCM, Cúp VTV8, Cúp Lucky Sport. Phong cách huấn luyện tận tâm, kỹ thuật cao.',
        '/images/coach-son.png',
        250000,
        50000,
        5.0,
        10,
        ARRAY['Chuyên nghiệp', 'Có chứng chỉ'],
        'active'
    ),
    (
        'c1000000-0000-0000-0000-000000000002'::uuid,
        'Văn Huỳnh Phương Huy',
        '0937009075',
        8,
        'HLV giàu kinh nghiệm với 8+ năm trong nghề. Chuyên đào tạo từ cơ bản đến nâng cao. Phong cách huấn luyện linh hoạt, phù hợp với mọi lứa tuổi.',
        '/images/coach-huy.jpg',
        230000,
        50000,
        5.0,
        10,
        ARRAY['Chuyên nghiệp', 'Kinh nghiệm'],
        'active'
    ),
    (
        'c1000000-0000-0000-0000-000000000003'::uuid,
        'Trần Thị Ngọc Thơ',
        NULL,
        5,
        'HLV nữ tận tâm với 5+ năm kinh nghiệm. Chuyên đào tạo học viên mới bắt đầu và thiếu niên. Lịch dạy buổi sáng sớm phù hợp với người đi làm.',
        NULL,
        200000,
        50000,
        5.0,
        10,
        ARRAY['Chuyên nghiệp', 'Tận tâm'],
        'active'
    ),
    (
        'c1000000-0000-0000-0000-000000000004'::uuid,
        'Võ Kỳ Long',
        NULL,
        20,
        'Kiện tướng bóng bàn với 20+ năm kinh nghiệm thi đấu và huấn luyện. Đào tạo chuyên sâu cho học viên muốn nâng cao kỹ năng thi đấu.',
        '/images/coach-long.png',
        250000,
        50000,
        5.0,
        15,
        ARRAY['Kiện tướng', 'Tận tâm', 'Chuyên nghiệp'],
        'active'
    );

-- =====================================================
-- 3. TRAINING_SESSIONS - Lịch dạy thật của HLV
-- day_of_week: 1=Thứ 2, 2=Thứ 3, ... 7=Chủ Nhật
-- =====================================================

-- HLV Thơ
INSERT INTO training_sessions (coach_id, day_of_week, start_time, end_time, session_type, status) VALUES
    ('c1000000-0000-0000-0000-000000000003'::uuid, 1, '07:00', '08:00', 'private', 'active'),
    ('c1000000-0000-0000-0000-000000000003'::uuid, 1, '08:30', '09:30', 'private', 'active'),
    ('c1000000-0000-0000-0000-000000000003'::uuid, 3, '07:00', '08:00', 'private', 'active'),
    ('c1000000-0000-0000-0000-000000000003'::uuid, 3, '08:30', '09:30', 'private', 'active'),
    ('c1000000-0000-0000-0000-000000000003'::uuid, 4, '06:15', '07:15', 'private', 'active'),
    ('c1000000-0000-0000-0000-000000000003'::uuid, 5, '07:00', '08:00', 'private', 'active'),
    ('c1000000-0000-0000-0000-000000000003'::uuid, 5, '08:30', '09:30', 'private', 'active'),
    ('c1000000-0000-0000-0000-000000000003'::uuid, 6, '06:15', '07:15', 'private', 'active');

-- HLV Sơn
INSERT INTO training_sessions (coach_id, day_of_week, start_time, end_time, session_type, status) VALUES
    ('c1000000-0000-0000-0000-000000000001'::uuid, 1, '16:30', '20:00', 'private', 'active'),
    ('c1000000-0000-0000-0000-000000000001'::uuid, 2, '16:30', '20:00', 'private', 'active'),
    ('c1000000-0000-0000-0000-000000000001'::uuid, 3, '16:30', '20:00', 'private', 'active'),
    ('c1000000-0000-0000-0000-000000000001'::uuid, 4, '16:30', '20:00', 'private', 'active'),
    ('c1000000-0000-0000-0000-000000000001'::uuid, 5, '17:30', '18:30', 'private', 'active'),
    ('c1000000-0000-0000-0000-000000000001'::uuid, 6, '09:00', '11:00', 'private', 'active'),
    ('c1000000-0000-0000-0000-000000000001'::uuid, 6, '16:00', '18:00', 'private', 'active'),
    ('c1000000-0000-0000-0000-000000000001'::uuid, 7, '09:00', '11:00', 'private', 'active'),
    ('c1000000-0000-0000-0000-000000000001'::uuid, 7, '16:00', '18:00', 'private', 'active');

-- HLV Huy
INSERT INTO training_sessions (coach_id, day_of_week, start_time, end_time, session_type, status) VALUES
    ('c1000000-0000-0000-0000-000000000002'::uuid, 2, '18:00', '20:00', 'private', 'active'),
    ('c1000000-0000-0000-0000-000000000002'::uuid, 4, '18:00', '20:00', 'private', 'active'),
    ('c1000000-0000-0000-0000-000000000002'::uuid, 6, '08:00', '09:00', 'private', 'active'),
    ('c1000000-0000-0000-0000-000000000002'::uuid, 7, '08:00', '10:30', 'private', 'active');

-- HLV Long
INSERT INTO training_sessions (coach_id, day_of_week, start_time, end_time, session_type, status) VALUES
    ('c1000000-0000-0000-0000-000000000004'::uuid, 1, '17:30', '20:30', 'private', 'active'),
    ('c1000000-0000-0000-0000-000000000004'::uuid, 3, '17:30', '20:30', 'private', 'active'),
    ('c1000000-0000-0000-0000-000000000004'::uuid, 5, '17:30', '20:30', 'private', 'active'),
    ('c1000000-0000-0000-0000-000000000004'::uuid, 6, '13:30', '16:30', 'private', 'active'),
    ('c1000000-0000-0000-0000-000000000004'::uuid, 7, '14:00', '15:00', 'private', 'active');

-- =====================================================
-- 4. MEMBERS - Học viên mẫu
-- =====================================================
INSERT INTO members (id, full_name, phone, email, join_date, payment_type, status, notes) VALUES
    ('d1000000-0000-0000-0000-000000000001'::uuid, 'Nguyễn Văn An', '0901234567', 'an.nguyen@email.com', '2024-01-15', 'monthly', 'active', 'Học viên tích cực, học với HLV Sơn'),
    ('d1000000-0000-0000-0000-000000000002'::uuid, 'Trần Thị Bình', '0912345678', 'binh.tran@email.com', '2024-02-20', 'per_visit', 'active', 'Học buổi sáng với HLV Thơ'),
    ('d1000000-0000-0000-0000-000000000003'::uuid, 'Lê Hoàng Cường', '0923456789', NULL, '2024-03-10', 'monthly', 'active', 'Đã chơi 2 năm, nâng cao kỹ năng'),
    ('d1000000-0000-0000-0000-000000000004'::uuid, 'Phạm Minh Đức', '0934567890', 'duc.pham@email.com', '2024-04-05', 'per_visit', 'active', 'Mới bắt đầu học'),
    ('d1000000-0000-0000-0000-000000000005'::uuid, 'Hoàng Thị Hoa', '0945678901', NULL, '2024-05-01', 'monthly', 'active', 'Thiếu niên, tiềm năng cao');

-- =====================================================
-- 5. PAYMENTS - Lịch sử thanh toán mẫu
-- =====================================================
INSERT INTO payments (member_id, amount, payment_type, payment_method, description, paid_at) VALUES
    ('d1000000-0000-0000-0000-000000000001'::uuid, 500000, 'monthly', 'bank_transfer', 'Phí tháng 12/2024', '2024-12-01 09:00:00+07'),
    ('d1000000-0000-0000-0000-000000000002'::uuid, 35000, 'per_visit', 'cash', 'Phí lượt tập - 15/12/2024', '2024-12-15 07:30:00+07'),
    ('d1000000-0000-0000-0000-000000000003'::uuid, 500000, 'monthly', 'momo', 'Phí tháng 12/2024', '2024-12-01 10:00:00+07'),
    ('d1000000-0000-0000-0000-000000000004'::uuid, 35000, 'per_visit', 'cash', 'Phí lượt tập - 16/12/2024', '2024-12-16 18:00:00+07'),
    ('d1000000-0000-0000-0000-000000000001'::uuid, 250000, 'coach_fee', 'cash', 'Học phí HLV Sơn - 1 giờ', '2024-12-16 20:00:00+07');

-- =====================================================
-- 6. EVENTS - Sự kiện / Giải đấu mẫu
-- =====================================================
INSERT INTO events (title, description, event_date, start_time, end_time, location, status) VALUES
    (
        'Giải Giao Lưu CLB LQD - Tháng 12/2024',
        'Giải đấu giao lưu cuối năm dành cho các thành viên CLB. Nhiều giải thưởng hấp dẫn!',
        '2024-12-28',
        '08:00',
        '17:00',
        '3B Lê Quý Đôn, Phú Nhuận, TP.HCM',
        'upcoming'
    ),
    (
        'Tập huấn kỹ thuật cơ bản - Tháng 1/2025',
        'Buổi tập huấn miễn phí dành cho học viên mới. Hướng dẫn kỹ thuật cầm vợt, đánh bóng cơ bản.',
        '2025-01-05',
        '09:00',
        '11:00',
        '3B Lê Quý Đôn, Phú Nhuận, TP.HCM',
        'upcoming'
    );

-- =====================================================
-- 7. GALLERY - Hình ảnh CLB
-- =====================================================
INSERT INTO gallery (title, description, image_url, category, sort_order, is_featured) VALUES
    ('Sân tập CLB', 'Không gian tập luyện hiện đại với 6 bàn chuyên nghiệp', '/images/gallery-1.jpg', 'facility', 1, true),
    ('Buổi tập luyện', 'Học viên tập luyện cùng HLV', '/images/gallery-2.jpg', 'training', 2, true),
    ('Giải đấu nội bộ', 'Giải đấu giao lưu cuối năm 2023', '/images/gallery-3.jpg', 'tournament', 3, false),
    ('Thiết bị chuyên nghiệp', 'Bàn và lưới chuẩn thi đấu', '/images/gallery-4.jpg', 'facility', 4, false),
    ('Đội ngũ HLV', 'Các huấn luyện viên CLB', '/images/gallery-5.jpg', 'general', 5, true);

-- =====================================================
-- 8. CONTACT_FORMS - Mẫu liên hệ
-- =====================================================
INSERT INTO contact_forms (name, phone, email, subject, message, status) VALUES
    ('Nguyễn Minh Tuấn', '0956789012', 'tuan@email.com', 'Đăng ký tập thử', 'Tôi muốn đăng ký tập thử vào cuối tuần. Xin hãy liên hệ.', 'new'),
    ('Trần Thị Lan', '0967890123', NULL, 'Hỏi về khóa học', 'Xin cho biết lịch học và học phí cho trẻ em 10 tuổi?', 'replied');
