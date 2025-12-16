/**
 * ============================================
 * FIRESTORE TYPE DEFINITIONS
 * CLB Bóng Bàn Lê Quý Đôn - Production Schema
 * ============================================
 */

import { Timestamp } from 'firebase/firestore';

// ============================================
// ENUMS - Strict type definitions
// ============================================

export type MemberRole = 'admin' | 'staff' | 'member';
export type MemberStatus = 'active' | 'inactive';
export type OrderStatus = 'pending' | 'paid' | 'canceled';
export type PaymentMethod = 'cash' | 'transfer';
export type PaymentStatus = 'success' | 'failed';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type LogAction =
    | 'CREATE_MEMBER' | 'UPDATE_MEMBER' | 'DELETE_MEMBER'
    | 'CREATE_SCHEDULE' | 'UPDATE_SCHEDULE' | 'DELETE_SCHEDULE'
    | 'CREATE_CONTACT' | 'UPDATE_CONTACT' | 'DELETE_CONTACT'
    | 'CREATE_PRODUCT' | 'UPDATE_PRODUCT' | 'DELETE_PRODUCT'
    | 'CREATE_ORDER' | 'UPDATE_ORDER' | 'DELETE_ORDER'
    | 'CREATE_PAYMENT' | 'UPDATE_PAYMENT' | 'DELETE_PAYMENT';

// ============================================
// COLLECTION SCHEMAS
// ============================================

/**
 * 👤 MEMBERS COLLECTION
 * Path: /members/{id}
 */
export interface Member {
    id?: string;
    fullName: string;
    phone: string;
    email: string;
    role: MemberRole;
    status: MemberStatus;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface MemberInput {
    fullName: string;
    phone: string;
    email: string;
    role: MemberRole;
    status: MemberStatus;
}

/**
 * 📅 SCHEDULES COLLECTION
 * Path: /schedules/{id}
 */
export interface Schedule {
    id?: string;
    dayOfWeek: DayOfWeek;
    startTime: string; // Format: "HH:mm"
    endTime: string;   // Format: "HH:mm"
    coach: string;
    note: string;
    createdAt: Timestamp;
}

export interface ScheduleInput {
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    coach: string;
    note: string;
}

/**
 * 📞 CONTACTS COLLECTION
 * Path: /contacts/{id}
 */
export interface Contact {
    id?: string;
    name: string;
    phone: string;
    message: string;
    createdAt: Timestamp;
    isRead: boolean;
}

export interface ContactInput {
    name: string;
    phone: string;
    message: string;
}

/**
 * 🏓 PRODUCTS COLLECTION
 * Path: /products/{id}
 */
export interface Product {
    id?: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    imageUrl: string;
    createdAt: Timestamp;
}

export interface ProductInput {
    name: string;
    price: number;
    stock: number;
    category: string;
    imageUrl: string;
}

/**
 * 🧾 ORDERS COLLECTION
 * Path: /orders/{id}
 */
export interface Order {
    id?: string;
    userId: string; // Reference: members/{id}
    items: OrderItem[];
    totalPrice: number;
    status: OrderStatus;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
}

export interface OrderInput {
    userId: string;
    items: OrderItem[];
    totalPrice: number;
}

/**
 * 💳 PAYMENTS COLLECTION
 * Path: /payments/{id}
 */
export interface Payment {
    id?: string;
    orderId: string; // Reference: orders/{id}
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    paidAt: Timestamp;
}

export interface PaymentInput {
    orderId: string;
    amount: number;
    method: PaymentMethod;
}

/**
 * 📝 LOGS COLLECTION
 * Path: /logs/{id}
 */
export interface Log {
    id?: string;
    action: LogAction;
    by: string; // userId who performed action
    data: Record<string, any>;
    createdAt: Timestamp;
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const COLLECTION_NAMES = {
    MEMBERS: 'members',
    SCHEDULES: 'schedules',
    CONTACTS: 'contacts',
    PRODUCTS: 'products',
    ORDERS: 'orders',
    PAYMENTS: 'payments',
    LOGS: 'logs',
} as const;

// ============================================
// VALIDATION FUNCTIONS
// ============================================

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    return phoneRegex.test(phone);
};

export const validateTimeFormat = (time: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
};

export const validateMember = (data: MemberInput): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.fullName || data.fullName.trim().length < 2) {
        errors.push('Họ tên phải có ít nhất 2 ký tự');
    }
    if (!validatePhone(data.phone)) {
        errors.push('Số điện thoại không hợp lệ');
    }
    if (!validateEmail(data.email)) {
        errors.push('Email không hợp lệ');
    }
    if (!['admin', 'staff', 'member'].includes(data.role)) {
        errors.push('Role không hợp lệ');
    }
    if (!['active', 'inactive'].includes(data.status)) {
        errors.push('Status không hợp lệ');
    }

    return { valid: errors.length === 0, errors };
};

export const validateSchedule = (data: ScheduleInput): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    const validDays: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!validDays.includes(data.dayOfWeek)) {
        errors.push('Ngày trong tuần không hợp lệ');
    }
    if (!validateTimeFormat(data.startTime)) {
        errors.push('Giờ bắt đầu không hợp lệ (HH:mm)');
    }
    if (!validateTimeFormat(data.endTime)) {
        errors.push('Giờ kết thúc không hợp lệ (HH:mm)');
    }
    if (!data.coach || data.coach.trim().length < 2) {
        errors.push('Tên HLV phải có ít nhất 2 ký tự');
    }

    return { valid: errors.length === 0, errors };
};

export const validateContact = (data: ContactInput): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length < 2) {
        errors.push('Tên phải có ít nhất 2 ký tự');
    }
    if (!validatePhone(data.phone)) {
        errors.push('Số điện thoại không hợp lệ');
    }
    if (!data.message || data.message.trim().length < 10) {
        errors.push('Tin nhắn phải có ít nhất 10 ký tự');
    }

    return { valid: errors.length === 0, errors };
};

export const validateProduct = (data: ProductInput): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length < 2) {
        errors.push('Tên sản phẩm phải có ít nhất 2 ký tự');
    }
    if (typeof data.price !== 'number' || data.price < 0) {
        errors.push('Giá sản phẩm phải >= 0');
    }
    if (typeof data.stock !== 'number' || data.stock < 0 || !Number.isInteger(data.stock)) {
        errors.push('Số lượng tồn kho phải là số nguyên >= 0');
    }
    if (!data.category || data.category.trim().length < 2) {
        errors.push('Danh mục phải có ít nhất 2 ký tự');
    }

    return { valid: errors.length === 0, errors };
};

export const validateOrder = (data: OrderInput): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.userId) {
        errors.push('userId là bắt buộc');
    }
    if (!Array.isArray(data.items) || data.items.length === 0) {
        errors.push('Đơn hàng phải có ít nhất 1 sản phẩm');
    }
    if (typeof data.totalPrice !== 'number' || data.totalPrice < 0) {
        errors.push('Tổng giá phải >= 0');
    }

    return { valid: errors.length === 0, errors };
};

export const validatePayment = (data: PaymentInput): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.orderId) {
        errors.push('orderId là bắt buộc');
    }
    if (typeof data.amount !== 'number' || data.amount <= 0) {
        errors.push('Số tiền thanh toán phải > 0');
    }
    if (!['cash', 'transfer'].includes(data.method)) {
        errors.push('Phương thức thanh toán không hợp lệ');
    }

    return { valid: errors.length === 0, errors };
};
