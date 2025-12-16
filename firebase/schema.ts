/**
 * ============================================================
 * 🏓 FIRESTORE SCHEMA DEFINITIONS
 * CLB Bóng Bàn Lê Quý Đôn - clbbongbanlequydon.com
 * ============================================================
 * 
 * ⚠️ IMPORTANT: NO FAKE DATA, NO SEED DATA, NO SAMPLE DATA
 * 
 * This file contains ONLY:
 * - TypeScript interfaces for type safety
 * - Collection structure definitions
 * - Field validation rules
 * 
 * All documents are created ONLY by:
 * - Real user actions (form submissions)
 * - Real admin actions (through Admin Panel)
 * 
 * ============================================================
 */

import { Timestamp, FieldValue } from 'firebase/firestore';

// ============================================================
// 🔧 COMMON TYPES
// ============================================================

export type DocumentStatus = 'active' | 'inactive' | 'deleted';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
export type PaymentMethod = 'cash' | 'transfer' | 'momo' | 'zalopay';
export type UserRole = 'admin' | 'staff' | 'member' | 'guest';
export type ContactStatus = 'new' | 'read' | 'replied' | 'archived';

// ============================================================
// 📋 COLLECTION: members
// ============================================================
/**
 * WHO creates: Admin only
 * WHEN: Admin adds a new member via Admin Panel
 * TRIGGER: Admin clicks "Save" in member form
 * DATA SOURCE: Real admin input
 */
export interface Member {
    id: string;
    fullName: string;           // Required, min 2 chars
    phone: string;              // Required, Vietnamese format
    email?: string;             // Optional, valid email
    dateOfBirth?: Timestamp;    // Optional
    gender?: 'male' | 'female';
    membershipType: 'regular' | 'vip' | 'student';
    membershipStart: Timestamp;
    membershipEnd: Timestamp;
    status: DocumentStatus;
    level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
    address?: string;
    notes?: string;
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
    createdBy: string;          // Admin user ID
}

// ============================================================
// 📋 COLLECTION: schedules
// ============================================================
/**
 * WHO creates: Admin only
 * WHEN: Admin creates a training schedule via Admin Panel
 * TRIGGER: Admin clicks "Save" in schedule form
 * DATA SOURCE: Real admin input
 */
export interface Schedule {
    id: string;
    title: string;              // Required, min 3 chars
    description?: string;
    dayOfWeek: number;          // 0-6 (Sunday-Saturday)
    startTime: string;          // HH:mm format
    endTime: string;            // HH:mm format
    coachName?: string;
    type: 'training' | 'class' | 'event';
    level: 'beginner' | 'intermediate' | 'advanced' | 'all';
    maxParticipants: number;    // Must be > 0
    price: number;              // Must be >= 0
    location?: string;
    status: DocumentStatus;
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
    createdBy: string;          // Admin user ID
}

// ============================================================
// 📋 COLLECTION: products
// ============================================================
/**
 * WHO creates: Admin only
 * WHEN: Admin adds a product via Admin Panel
 * TRIGGER: Admin clicks "Save" in product form
 * DATA SOURCE: Real admin input
 */
export interface Product {
    id: string;
    name: string;               // Required, min 2 chars
    description?: string;
    price: number;              // Required, must be > 0
    originalPrice?: number;
    stock: number;              // Must be >= 0
    category: 'racket' | 'rubber' | 'ball' | 'accessory' | 'clothing' | 'other';
    brand?: string;
    sku?: string;
    imageUrl?: string;
    status: DocumentStatus;
    featured: boolean;
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
    createdBy: string;          // Admin user ID
}

// ============================================================
// 📋 COLLECTION: contacts
// ============================================================
/**
 * WHO creates: Public users (anyone)
 * WHEN: User submits contact form on website
 * TRIGGER: User clicks "Submit" on contact form
 * DATA SOURCE: Real user input from website form
 */
export interface Contact {
    id: string;
    name: string;               // Required, min 2 chars, max 100
    phone: string;              // Required, Vietnamese format
    email?: string;             // Optional, valid email
    subject?: string;           // Optional
    message: string;            // Required, min 10 chars, max 2000
    status: ContactStatus;
    repliedAt?: Timestamp;
    repliedBy?: string;
    replyMessage?: string;
    createdAt: Timestamp | FieldValue;
}

// ============================================================
// 📋 COLLECTION: visits
// ============================================================
/**
 * WHO creates: Admin or Staff
 * WHEN: A visitor comes to play at the club
 * TRIGGER: Staff records the visit via Admin Panel
 * DATA SOURCE: Real visitor information
 */
export interface Visit {
    id: string;
    visitorName: string;        // Required
    visitorPhone?: string;
    memberId?: string;          // Reference to member if exists
    date: Timestamp;
    checkInTime: Timestamp;
    checkOutTime?: Timestamp;
    tableNumber?: number;
    playType: 'hourly' | 'daily' | 'monthly';
    price: number;              // Must be > 0
    paymentStatus: PaymentStatus;
    paymentMethod?: PaymentMethod;
    notes?: string;
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
    createdBy: string;          // Staff/Admin user ID
}

// ============================================================
// 📋 COLLECTION: payments
// ============================================================
/**
 * WHO creates: Admin or Staff (or System)
 * WHEN: A payment is recorded
 * TRIGGER: Staff records payment or payment is auto-created with visit
 * DATA SOURCE: Real payment transaction
 */
export interface Payment {
    id: string;
    referenceId: string;        // visitId, memberId, or orderId
    referenceType: 'visit' | 'membership' | 'order' | 'event';
    amount: number;             // Must be > 0
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string;
    paidAt?: Timestamp;
    notes?: string;
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
    createdBy: string;
}

// ============================================================
// 📋 COLLECTION: orders
// ============================================================
/**
 * WHO creates: Admin or authenticated user (for products)
 * WHEN: An order is placed
 * TRIGGER: User/Admin submits order form
 * DATA SOURCE: Real order from user
 */
export interface Order {
    id: string;
    orderNumber: string;        // Auto-generated
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    items: OrderItem[];
    subtotal: number;
    shippingFee: number;
    discount: number;
    totalPrice: number;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled';
    shippingAddress?: string;
    notes?: string;
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
    createdBy?: string;
}

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;           // Must be > 0
    unitPrice: number;
    totalPrice: number;
}

// ============================================================
// 📋 COLLECTION: logs
// ============================================================
/**
 * WHO creates: System (automatic)
 * WHEN: Any write operation happens
 * TRIGGER: Automatic logging on create/update/delete
 * DATA SOURCE: System-generated
 */
export interface Log {
    id: string;
    action: 'create' | 'update' | 'delete' | 'login' | 'logout';
    collection: string;
    documentId?: string;
    userId: string;
    userEmail?: string;
    oldData?: Record<string, any>;
    newData?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Timestamp | FieldValue;
}

// ============================================================
// 📋 VALIDATION RULES
// ============================================================

export const VALIDATION = {
    name: { min: 2, max: 100 },
    phone: /^(0|\+84)[0-9]{9,10}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: { min: 10, max: 2000 },
    price: { min: 0 },
    quantity: { min: 1 },
};

// ============================================================
// 📋 COLLECTION NAMES (for reference)
// ============================================================

export const COLLECTIONS = {
    MEMBERS: 'members',
    SCHEDULES: 'schedules',
    PRODUCTS: 'products',
    CONTACTS: 'contacts',
    VISITS: 'visits',
    PAYMENTS: 'payments',
    ORDERS: 'orders',
    LOGS: 'logs',
} as const;
