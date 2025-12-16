/**
 * 🔥 PRODUCTION DATABASE SCHEMA
 * CLB Bóng Bàn Lê Quý Đôn
 * 
 * Tất cả các bảng theo yêu cầu với đầy đủ validation
 */

import { Timestamp, FieldValue } from 'firebase/firestore';

// ============================================
// 🔐 USERS - Người dùng hệ thống
// ============================================
export type UserRole = 'admin' | 'staff' | 'member' | 'guest';
export type UserStatus = 'active' | 'banned' | 'pending';

export interface User {
    id: string;                    // UUID
    full_name: string;             // Họ tên đầy đủ
    phone: string;                 // Số điện thoại VN
    email: string;                 // Email
    role: UserRole;                // Vai trò
    status: UserStatus;            // Trạng thái
    avatar_url?: string;           // Avatar
    password_hash?: string;        // Hash password (bcrypt) - chỉ lưu server
    created_at: Timestamp;         // Ngày tạo
    updated_at: Timestamp;         // Ngày cập nhật
    last_login?: Timestamp;        // Lần đăng nhập cuối
    created_by?: string;           // ID người tạo
    updated_by?: string;           // ID người cập nhật
}

export interface UserInput {
    full_name: string;
    phone: string;
    email: string;
    role?: UserRole;
    password?: string;             // Plain password - sẽ được hash
    avatar_url?: string;
}

// ============================================
// 🏓 VISITORS - Khách đến chơi
// ============================================
export type PlayType = 'hourly' | 'daily' | 'monthly' | 'yearly';
export type PaymentMethod = 'cash' | 'transfer' | 'momo' | 'zalopay' | 'card';

export interface Visitor {
    id: string;
    user_id: string | null;        // Liên kết user (nullable cho khách vãng lai)
    visitor_name: string;          // Tên khách (nếu không có user_id)
    visitor_phone?: string;        // SĐT khách
    visit_date: Timestamp;         // Ngày đến
    check_in_time: Timestamp;      // Giờ vào
    check_out_time?: Timestamp;    // Giờ ra
    play_type: PlayType;           // Loại chơi
    table_number?: number;         // Số bàn
    price: number;                 // Giá tiền (VND)
    payment_method: PaymentMethod; // Phương thức thanh toán
    payment_status: PaymentStatus; // Trạng thái thanh toán
    note?: string;                 // Ghi chú
    created_at: Timestamp;
    updated_at: Timestamp;
    created_by: string;            // Staff tạo
    updated_by?: string;
    deleted_at?: Timestamp;        // Soft delete
}

export interface VisitorInput {
    user_id?: string | null;
    visitor_name: string;
    visitor_phone?: string;
    visit_date: Date;
    check_in_time: Date;
    check_out_time?: Date;
    play_type: PlayType;
    table_number?: number;
    price: number;
    payment_method: PaymentMethod;
    note?: string;
}

// ============================================
// 🧾 PAYMENTS - Thanh toán
// ============================================
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
export type PaymentType = 'visitor' | 'order' | 'membership' | 'other';

export interface Payment {
    id: string;
    reference_id: string;          // ID tham chiếu (visitor_id, order_id, ...)
    reference_type: PaymentType;   // Loại tham chiếu
    user_id?: string;              // User thanh toán
    amount: number;                // Số tiền (VND)
    payment_method: PaymentMethod; // Phương thức
    payment_status: PaymentStatus; // Trạng thái
    payment_time?: Timestamp;      // Thời gian thanh toán
    transaction_id?: string;       // Mã giao dịch từ payment gateway
    note?: string;                 // Ghi chú
    metadata?: Record<string, any>;// Dữ liệu bổ sung
    created_at: Timestamp;
    updated_at: Timestamp;
    created_by: string;
    updated_by?: string;
    deleted_at?: Timestamp;
}

export interface PaymentInput {
    reference_id: string;
    reference_type: PaymentType;
    user_id?: string;
    amount: number;
    payment_method: PaymentMethod;
    note?: string;
    metadata?: Record<string, any>;
}

// ============================================
// 📅 SCHEDULES - Lịch tập
// ============================================
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type ScheduleStatus = 'active' | 'inactive' | 'cancelled';

export interface Schedule {
    id: string;
    day_of_week: DayOfWeek;        // Ngày trong tuần
    start_time: string;            // Giờ bắt đầu (HH:mm)
    end_time: string;              // Giờ kết thúc (HH:mm)
    coach_id?: string;             // ID HLV (liên kết users)
    coach_name: string;            // Tên HLV
    max_participants?: number;     // Số người tối đa
    current_participants: number;  // Số người hiện tại
    description?: string;          // Mô tả
    price?: number;                // Giá (nếu có)
    location?: string;             // Địa điểm
    status: ScheduleStatus;        // Trạng thái
    created_at: Timestamp;
    updated_at: Timestamp;
    created_by: string;
    updated_by?: string;
    deleted_at?: Timestamp;
}

export interface ScheduleInput {
    day_of_week: DayOfWeek;
    start_time: string;
    end_time: string;
    coach_id?: string;
    coach_name: string;
    max_participants?: number;
    description?: string;
    price?: number;
    location?: string;
}

// ============================================
// 🛒 PRODUCTS - Sản phẩm shop
// ============================================
export type ProductCategory = 'racket' | 'rubber' | 'blade' | 'ball' | 'table' | 'accessory' | 'clothing' | 'other';
export type ProductStatus = 'active' | 'inactive' | 'out_of_stock' | 'discontinued';

export interface Product {
    id: string;
    name: string;                  // Tên sản phẩm
    slug: string;                  // URL slug
    description?: string;          // Mô tả
    price: number;                 // Giá bán (VND)
    original_price?: number;       // Giá gốc
    stock: number;                 // Số lượng tồn kho
    category: ProductCategory;     // Danh mục
    brand?: string;                // Thương hiệu
    sku?: string;                  // Mã sản phẩm
    image_url?: string;            // Ảnh chính
    images?: string[];             // Danh sách ảnh
    specifications?: Record<string, string>; // Thông số kỹ thuật
    status: ProductStatus;         // Trạng thái
    featured: boolean;             // Nổi bật
    rating?: number;               // Đánh giá trung bình
    review_count: number;          // Số lượt đánh giá
    sold_count: number;            // Số lượng đã bán
    created_at: Timestamp;
    updated_at: Timestamp;
    created_by: string;
    updated_by?: string;
    deleted_at?: Timestamp;
}

export interface ProductInput {
    name: string;
    description?: string;
    price: number;
    original_price?: number;
    stock: number;
    category: ProductCategory;
    brand?: string;
    sku?: string;
    image_url?: string;
    images?: string[];
    specifications?: Record<string, string>;
    featured?: boolean;
}

// ============================================
// 📦 ORDERS - Đơn hàng
// ============================================
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled' | 'refunded';

export interface Order {
    id: string;
    order_number: string;          // Mã đơn hàng (CLB-YYYYMMDD-XXXX)
    user_id: string;               // ID người đặt
    customer_name: string;         // Tên khách hàng
    customer_phone: string;        // SĐT
    customer_email?: string;       // Email
    shipping_address?: string;     // Địa chỉ giao hàng
    items: OrderItem[];            // Danh sách sản phẩm
    subtotal: number;              // Tổng tiền hàng
    shipping_fee: number;          // Phí vận chuyển
    discount: number;              // Giảm giá
    total_price: number;           // Tổng thanh toán
    payment_method: PaymentMethod; // Phương thức thanh toán
    payment_status: PaymentStatus; // Trạng thái thanh toán
    order_status: OrderStatus;     // Trạng thái đơn hàng
    note?: string;                 // Ghi chú
    tracking_number?: string;      // Mã vận đơn
    shipped_at?: Timestamp;        // Thời gian giao hàng
    delivered_at?: Timestamp;      // Thời gian nhận hàng
    cancelled_at?: Timestamp;      // Thời gian hủy
    cancel_reason?: string;        // Lý do hủy
    created_at: Timestamp;
    updated_at: Timestamp;
    created_by: string;
    updated_by?: string;
    deleted_at?: Timestamp;
}

export interface OrderInput {
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    shipping_address?: string;
    items: OrderItemInput[];
    shipping_fee?: number;
    discount?: number;
    payment_method: PaymentMethod;
    note?: string;
}

// ============================================
// 🧩 ORDER_ITEMS - Chi tiết đơn hàng
// ============================================
export interface OrderItem {
    id: string;
    product_id: string;            // ID sản phẩm
    product_name: string;          // Tên sản phẩm (snapshot)
    product_image?: string;        // Ảnh sản phẩm (snapshot)
    quantity: number;              // Số lượng
    unit_price: number;            // Đơn giá
    total_price: number;           // Thành tiền
}

export interface OrderItemInput {
    product_id: string;
    quantity: number;
}

// ============================================
// 📋 CONTACTS - Liên hệ
// ============================================
export type ContactStatus = 'new' | 'read' | 'replied' | 'archived';
export type ContactType = 'general' | 'support' | 'feedback' | 'partnership' | 'complaint';

export interface Contact {
    id: string;
    name: string;
    phone: string;
    email?: string;
    subject?: string;
    message: string;
    contact_type: ContactType;
    status: ContactStatus;
    replied_at?: Timestamp;
    replied_by?: string;
    reply_message?: string;
    ip_address?: string;
    user_agent?: string;
    created_at: Timestamp;
    updated_at: Timestamp;
    deleted_at?: Timestamp;
}

export interface ContactInput {
    name: string;
    phone: string;
    email?: string;
    subject?: string;
    message: string;
    contact_type?: ContactType;
}

// ============================================
// 📝 AUDIT_LOGS - Log hệ thống
// ============================================
export type LogAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'export' | 'import';
export type LogLevel = 'info' | 'warning' | 'error' | 'critical';

export interface AuditLog {
    id: string;
    user_id?: string;              // ID người thực hiện
    user_email?: string;           // Email người thực hiện
    action: LogAction;             // Hành động
    collection: string;            // Collection bị ảnh hưởng
    document_id?: string;          // ID document
    old_data?: Record<string, any>;// Dữ liệu cũ
    new_data?: Record<string, any>;// Dữ liệu mới
    changes?: Record<string, { old: any; new: any }>; // Chi tiết thay đổi
    level: LogLevel;               // Mức độ
    message?: string;              // Thông báo
    ip_address?: string;           // IP
    user_agent?: string;           // User Agent
    metadata?: Record<string, any>;// Dữ liệu bổ sung
    created_at: Timestamp;
}

// ============================================
// 🔔 NOTIFICATIONS - Thông báo
// ============================================
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
    id: string;
    user_id: string;               // ID người nhận
    title: string;                 // Tiêu đề
    message: string;               // Nội dung
    type: NotificationType;        // Loại
    read: boolean;                 // Đã đọc
    link?: string;                 // Link liên quan
    created_at: Timestamp;
    read_at?: Timestamp;
}

// ============================================
// 📊 STATS - Thống kê (aggregated)
// ============================================
export interface DailyStats {
    id: string;                    // YYYY-MM-DD
    date: Timestamp;
    total_visitors: number;
    total_revenue: number;
    total_orders: number;
    new_members: number;
    created_at: Timestamp;
    updated_at: Timestamp;
}

// ============================================
// 🔧 VALIDATION SCHEMAS
// ============================================

// Regex patterns
export const PATTERNS = {
    PHONE_VN: /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/,
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    TIME_24H: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
};

// Validation rules
export const VALIDATION = {
    user: {
        full_name: { required: true, minLength: 2, maxLength: 100 },
        phone: { required: true, pattern: PATTERNS.PHONE_VN },
        email: { required: true, pattern: PATTERNS.EMAIL },
        password: { required: true, minLength: 8, maxLength: 128 },
    },
    visitor: {
        visitor_name: { required: true, minLength: 2, maxLength: 100 },
        price: { required: true, min: 0 },
        table_number: { min: 1, max: 20 },
    },
    payment: {
        amount: { required: true, min: 1000 }, // Tối thiểu 1000 VND
    },
    schedule: {
        start_time: { required: true, pattern: PATTERNS.TIME_24H },
        end_time: { required: true, pattern: PATTERNS.TIME_24H },
        coach_name: { required: true, minLength: 2, maxLength: 100 },
    },
    product: {
        name: { required: true, minLength: 2, maxLength: 200 },
        price: { required: true, min: 0 },
        stock: { required: true, min: 0 },
    },
    order: {
        customer_name: { required: true, minLength: 2, maxLength: 100 },
        customer_phone: { required: true, pattern: PATTERNS.PHONE_VN },
        items: { required: true, minLength: 1 },
    },
    contact: {
        name: { required: true, minLength: 2, maxLength: 100 },
        phone: { required: true, pattern: PATTERNS.PHONE_VN },
        message: { required: true, minLength: 10, maxLength: 2000 },
    },
};

// ============================================
// 🛡️ PERMISSION MATRIX
// ============================================
export const PERMISSIONS: Record<UserRole, Record<string, string[]>> = {
    admin: {
        users: ['create', 'read', 'update', 'delete'],
        visitors: ['create', 'read', 'update', 'delete'],
        payments: ['create', 'read', 'update', 'delete'],
        schedules: ['create', 'read', 'update', 'delete'],
        products: ['create', 'read', 'update', 'delete'],
        orders: ['create', 'read', 'update', 'delete'],
        contacts: ['create', 'read', 'update', 'delete'],
        logs: ['read'],
        stats: ['read'],
    },
    staff: {
        users: ['read'],
        visitors: ['create', 'read', 'update'],
        payments: ['create', 'read', 'update'],
        schedules: ['read'],
        products: ['read', 'update'],
        orders: ['create', 'read', 'update'],
        contacts: ['read', 'update'],
        logs: [],
        stats: ['read'],
    },
    member: {
        users: ['read'], // Chỉ đọc thông tin của chính mình
        visitors: ['read'], // Chỉ lịch sử của mình
        payments: ['read'], // Chỉ lịch sử của mình
        schedules: ['read'],
        products: ['read'],
        orders: ['create', 'read'], // Tạo và xem đơn của mình
        contacts: ['create'],
        logs: [],
        stats: [],
    },
    guest: {
        users: [],
        visitors: [],
        payments: [],
        schedules: ['read'],
        products: ['read'],
        orders: [],
        contacts: ['create'],
        logs: [],
        stats: [],
    },
};

// ============================================
// 📤 API RESPONSE TYPES
// ============================================
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: Record<string, string[]>;
    };
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
        hasMore?: boolean;
    };
    timestamp: string;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
    search?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    [key: string]: any;
}
