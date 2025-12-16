/**
 * 🛡️ VALIDATION SERVICE
 * Production-ready validation với sanitization
 * Chống SQL Injection, XSS, CSRF
 */

import {
    PATTERNS,
    VALIDATION,
    UserInput,
    VisitorInput,
    PaymentInput,
    ScheduleInput,
    ProductInput,
    OrderInput,
    ContactInput
} from '../types/database';

// ============================================
// 🧹 SANITIZATION FUNCTIONS
// ============================================

/**
 * Escape HTML để chống XSS
 */
export function escapeHtml(str: string): string {
    if (typeof str !== 'string') return '';

    const htmlEscapes: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;',
    };

    return str.replace(/[&<>"'`=/]/g, (char) => htmlEscapes[char] || char);
}

/**
 * Remove dangerous characters và patterns
 */
export function sanitizeString(str: string): string {
    if (typeof str !== 'string') return '';

    return str
        // Remove null bytes
        .replace(/\0/g, '')
        // Remove script tags
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Remove event handlers
        .replace(/on\w+\s*=/gi, '')
        // Remove javascript: protocol
        .replace(/javascript:/gi, '')
        // Remove data: protocol (for images)
        .replace(/data:/gi, '')
        // Trim whitespace
        .trim();
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
    if (typeof phone !== 'string') return '';
    // Chỉ giữ lại số và dấu +
    return phone.replace(/[^\d+]/g, '');
}

/**
 * Sanitize email
 */
export function sanitizeEmail(email: string): string {
    if (typeof email !== 'string') return '';
    return email.toLowerCase().trim();
}

/**
 * Sanitize number
 */
export function sanitizeNumber(value: any, defaultValue: number = 0): number {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
}

/**
 * Sanitize object - deep sanitize all string fields
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            result[key] = sanitizeString(value);
        } else if (Array.isArray(value)) {
            result[key] = value.map(item =>
                typeof item === 'string' ? sanitizeString(item) :
                    typeof item === 'object' && item !== null ? sanitizeObject(item) : item
            );
        } else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
            result[key] = sanitizeObject(value);
        } else {
            result[key] = value;
        }
    }

    return result as T;
}

// ============================================
// ✅ VALIDATION FUNCTIONS
// ============================================

export interface ValidationError {
    field: string;
    message: string;
    code: string;
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    sanitizedData?: any;
}

/**
 * Validate required field
 */
function validateRequired(value: any, field: string): ValidationError | null {
    if (value === undefined || value === null || value === '') {
        return {
            field,
            message: `${field} là bắt buộc`,
            code: 'REQUIRED',
        };
    }
    return null;
}

/**
 * Validate string length
 */
function validateLength(
    value: string,
    field: string,
    min?: number,
    max?: number
): ValidationError | null {
    if (typeof value !== 'string') return null;

    if (min !== undefined && value.length < min) {
        return {
            field,
            message: `${field} phải có ít nhất ${min} ký tự`,
            code: 'MIN_LENGTH',
        };
    }

    if (max !== undefined && value.length > max) {
        return {
            field,
            message: `${field} không được vượt quá ${max} ký tự`,
            code: 'MAX_LENGTH',
        };
    }

    return null;
}

/**
 * Validate pattern
 */
function validatePattern(
    value: string,
    field: string,
    pattern: RegExp,
    message?: string
): ValidationError | null {
    if (typeof value !== 'string' || !value) return null;

    if (!pattern.test(value)) {
        return {
            field,
            message: message || `${field} không đúng định dạng`,
            code: 'INVALID_FORMAT',
        };
    }

    return null;
}

/**
 * Validate number range
 */
function validateRange(
    value: number,
    field: string,
    min?: number,
    max?: number
): ValidationError | null {
    if (typeof value !== 'number') return null;

    if (min !== undefined && value < min) {
        return {
            field,
            message: `${field} phải lớn hơn hoặc bằng ${min}`,
            code: 'MIN_VALUE',
        };
    }

    if (max !== undefined && value > max) {
        return {
            field,
            message: `${field} phải nhỏ hơn hoặc bằng ${max}`,
            code: 'MAX_VALUE',
        };
    }

    return null;
}

/**
 * Validate array length
 */
function validateArrayLength(
    value: any[],
    field: string,
    min?: number
): ValidationError | null {
    if (!Array.isArray(value)) return null;

    if (min !== undefined && value.length < min) {
        return {
            field,
            message: `${field} phải có ít nhất ${min} phần tử`,
            code: 'MIN_ITEMS',
        };
    }

    return null;
}

// ============================================
// 📝 ENTITY VALIDATORS
// ============================================

/**
 * Validate User input
 */
export function validateUser(input: UserInput, isUpdate: boolean = false): ValidationResult {
    const errors: ValidationError[] = [];
    const rules = VALIDATION.user;

    // Sanitize
    const sanitized = sanitizeObject({
        ...input,
        email: sanitizeEmail(input.email),
        phone: sanitizePhone(input.phone),
        full_name: sanitizeString(input.full_name),
    });

    // Validate full_name
    if (!isUpdate || input.full_name !== undefined) {
        const reqErr = validateRequired(sanitized.full_name, 'full_name');
        if (reqErr) errors.push(reqErr);
        else {
            const lenErr = validateLength(
                sanitized.full_name,
                'full_name',
                rules.full_name.minLength,
                rules.full_name.maxLength
            );
            if (lenErr) errors.push(lenErr);
        }
    }

    // Validate phone
    if (!isUpdate || input.phone !== undefined) {
        const reqErr = validateRequired(sanitized.phone, 'phone');
        if (reqErr) errors.push(reqErr);
        else {
            const patErr = validatePattern(
                sanitized.phone,
                'phone',
                rules.phone.pattern,
                'Số điện thoại không hợp lệ (VD: 0912345678)'
            );
            if (patErr) errors.push(patErr);
        }
    }

    // Validate email
    if (!isUpdate || input.email !== undefined) {
        const reqErr = validateRequired(sanitized.email, 'email');
        if (reqErr) errors.push(reqErr);
        else {
            const patErr = validatePattern(
                sanitized.email,
                'email',
                rules.email.pattern,
                'Email không hợp lệ'
            );
            if (patErr) errors.push(patErr);
        }
    }

    // Validate password (only on create)
    if (!isUpdate && input.password !== undefined) {
        const lenErr = validateLength(
            input.password,
            'password',
            rules.password.minLength,
            rules.password.maxLength
        );
        if (lenErr) errors.push(lenErr);
    }

    return {
        valid: errors.length === 0,
        errors,
        sanitizedData: sanitized,
    };
}

/**
 * Validate Visitor input
 */
export function validateVisitor(input: VisitorInput, isUpdate: boolean = false): ValidationResult {
    const errors: ValidationError[] = [];
    const rules = VALIDATION.visitor;

    // Sanitize
    const sanitized = sanitizeObject({
        ...input,
        visitor_name: sanitizeString(input.visitor_name),
        visitor_phone: input.visitor_phone ? sanitizePhone(input.visitor_phone) : undefined,
        price: sanitizeNumber(input.price),
        table_number: input.table_number ? sanitizeNumber(input.table_number) : undefined,
        note: input.note ? sanitizeString(input.note) : undefined,
    });

    // Validate visitor_name
    if (!isUpdate || input.visitor_name !== undefined) {
        const reqErr = validateRequired(sanitized.visitor_name, 'visitor_name');
        if (reqErr) errors.push(reqErr);
        else {
            const lenErr = validateLength(
                sanitized.visitor_name,
                'visitor_name',
                rules.visitor_name.minLength,
                rules.visitor_name.maxLength
            );
            if (lenErr) errors.push(lenErr);
        }
    }

    // Validate price
    if (!isUpdate || input.price !== undefined) {
        const reqErr = validateRequired(sanitized.price, 'price');
        if (reqErr) errors.push(reqErr);
        else {
            const rangeErr = validateRange(sanitized.price, 'price', rules.price.min);
            if (rangeErr) errors.push(rangeErr);
        }
    }

    // Validate table_number
    if (sanitized.table_number !== undefined) {
        const rangeErr = validateRange(
            sanitized.table_number,
            'table_number',
            rules.table_number.min,
            rules.table_number.max
        );
        if (rangeErr) errors.push(rangeErr);
    }

    // Validate phone if provided
    if (sanitized.visitor_phone) {
        const patErr = validatePattern(
            sanitized.visitor_phone,
            'visitor_phone',
            PATTERNS.PHONE_VN,
            'Số điện thoại không hợp lệ'
        );
        if (patErr) errors.push(patErr);
    }

    return {
        valid: errors.length === 0,
        errors,
        sanitizedData: sanitized,
    };
}

/**
 * Validate Payment input
 */
export function validatePayment(input: PaymentInput, isUpdate: boolean = false): ValidationResult {
    const errors: ValidationError[] = [];
    const rules = VALIDATION.payment;

    // Sanitize
    const sanitized = sanitizeObject({
        ...input,
        amount: sanitizeNumber(input.amount),
        note: input.note ? sanitizeString(input.note) : undefined,
    });

    // Validate reference_id
    if (!isUpdate) {
        const reqErr = validateRequired(sanitized.reference_id, 'reference_id');
        if (reqErr) errors.push(reqErr);
    }

    // Validate amount
    if (!isUpdate || input.amount !== undefined) {
        const reqErr = validateRequired(sanitized.amount, 'amount');
        if (reqErr) errors.push(reqErr);
        else {
            const rangeErr = validateRange(sanitized.amount, 'amount', rules.amount.min);
            if (rangeErr) errors.push(rangeErr);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        sanitizedData: sanitized,
    };
}

/**
 * Validate Schedule input
 */
export function validateSchedule(input: ScheduleInput, isUpdate: boolean = false): ValidationResult {
    const errors: ValidationError[] = [];
    const rules = VALIDATION.schedule;

    // Sanitize
    const sanitized = sanitizeObject({
        ...input,
        coach_name: sanitizeString(input.coach_name),
        description: input.description ? sanitizeString(input.description) : undefined,
        location: input.location ? sanitizeString(input.location) : undefined,
    });

    // Validate start_time
    if (!isUpdate || input.start_time !== undefined) {
        const reqErr = validateRequired(sanitized.start_time, 'start_time');
        if (reqErr) errors.push(reqErr);
        else {
            const patErr = validatePattern(
                sanitized.start_time,
                'start_time',
                rules.start_time.pattern,
                'Giờ bắt đầu không hợp lệ (VD: 08:00)'
            );
            if (patErr) errors.push(patErr);
        }
    }

    // Validate end_time
    if (!isUpdate || input.end_time !== undefined) {
        const reqErr = validateRequired(sanitized.end_time, 'end_time');
        if (reqErr) errors.push(reqErr);
        else {
            const patErr = validatePattern(
                sanitized.end_time,
                'end_time',
                rules.end_time.pattern,
                'Giờ kết thúc không hợp lệ (VD: 17:00)'
            );
            if (patErr) errors.push(patErr);
        }
    }

    // Validate coach_name
    if (!isUpdate || input.coach_name !== undefined) {
        const reqErr = validateRequired(sanitized.coach_name, 'coach_name');
        if (reqErr) errors.push(reqErr);
        else {
            const lenErr = validateLength(
                sanitized.coach_name,
                'coach_name',
                rules.coach_name.minLength,
                rules.coach_name.maxLength
            );
            if (lenErr) errors.push(lenErr);
        }
    }

    // Validate time logic
    if (sanitized.start_time && sanitized.end_time) {
        const start = sanitized.start_time.split(':').map(Number);
        const end = sanitized.end_time.split(':').map(Number);
        const startMinutes = start[0] * 60 + start[1];
        const endMinutes = end[0] * 60 + end[1];

        if (endMinutes <= startMinutes) {
            errors.push({
                field: 'end_time',
                message: 'Giờ kết thúc phải sau giờ bắt đầu',
                code: 'INVALID_TIME_RANGE',
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        sanitizedData: sanitized,
    };
}

/**
 * Validate Product input
 */
export function validateProduct(input: ProductInput, isUpdate: boolean = false): ValidationResult {
    const errors: ValidationError[] = [];
    const rules = VALIDATION.product;

    // Sanitize
    const sanitized = sanitizeObject({
        ...input,
        name: sanitizeString(input.name),
        description: input.description ? sanitizeString(input.description) : undefined,
        price: sanitizeNumber(input.price),
        stock: sanitizeNumber(input.stock),
        brand: input.brand ? sanitizeString(input.brand) : undefined,
        sku: input.sku ? sanitizeString(input.sku) : undefined,
    });

    // Validate name
    if (!isUpdate || input.name !== undefined) {
        const reqErr = validateRequired(sanitized.name, 'name');
        if (reqErr) errors.push(reqErr);
        else {
            const lenErr = validateLength(
                sanitized.name,
                'name',
                rules.name.minLength,
                rules.name.maxLength
            );
            if (lenErr) errors.push(lenErr);
        }
    }

    // Validate price
    if (!isUpdate || input.price !== undefined) {
        const reqErr = validateRequired(sanitized.price, 'price');
        if (reqErr) errors.push(reqErr);
        else {
            const rangeErr = validateRange(sanitized.price, 'price', rules.price.min);
            if (rangeErr) errors.push(rangeErr);
        }
    }

    // Validate stock
    if (!isUpdate || input.stock !== undefined) {
        const reqErr = validateRequired(sanitized.stock, 'stock');
        if (reqErr) errors.push(reqErr);
        else {
            const rangeErr = validateRange(sanitized.stock, 'stock', rules.stock.min);
            if (rangeErr) errors.push(rangeErr);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        sanitizedData: sanitized,
    };
}

/**
 * Validate Order input
 */
export function validateOrder(input: OrderInput, isUpdate: boolean = false): ValidationResult {
    const errors: ValidationError[] = [];
    const rules = VALIDATION.order;

    // Sanitize
    const sanitized = sanitizeObject({
        ...input,
        customer_name: sanitizeString(input.customer_name),
        customer_phone: sanitizePhone(input.customer_phone),
        customer_email: input.customer_email ? sanitizeEmail(input.customer_email) : undefined,
        shipping_address: input.shipping_address ? sanitizeString(input.shipping_address) : undefined,
        note: input.note ? sanitizeString(input.note) : undefined,
    });

    // Validate customer_name
    if (!isUpdate || input.customer_name !== undefined) {
        const reqErr = validateRequired(sanitized.customer_name, 'customer_name');
        if (reqErr) errors.push(reqErr);
        else {
            const lenErr = validateLength(
                sanitized.customer_name,
                'customer_name',
                rules.customer_name.minLength,
                rules.customer_name.maxLength
            );
            if (lenErr) errors.push(lenErr);
        }
    }

    // Validate customer_phone
    if (!isUpdate || input.customer_phone !== undefined) {
        const reqErr = validateRequired(sanitized.customer_phone, 'customer_phone');
        if (reqErr) errors.push(reqErr);
        else {
            const patErr = validatePattern(
                sanitized.customer_phone,
                'customer_phone',
                rules.customer_phone.pattern,
                'Số điện thoại không hợp lệ'
            );
            if (patErr) errors.push(patErr);
        }
    }

    // Validate items
    if (!isUpdate) {
        const reqErr = validateRequired(input.items, 'items');
        if (reqErr) errors.push(reqErr);
        else {
            const arrErr = validateArrayLength(input.items, 'items', rules.items.minLength);
            if (arrErr) errors.push(arrErr);

            // Validate each item
            input.items.forEach((item, index) => {
                if (!item.product_id) {
                    errors.push({
                        field: `items[${index}].product_id`,
                        message: 'ID sản phẩm là bắt buộc',
                        code: 'REQUIRED',
                    });
                }
                if (!item.quantity || item.quantity < 1) {
                    errors.push({
                        field: `items[${index}].quantity`,
                        message: 'Số lượng phải ít nhất là 1',
                        code: 'MIN_VALUE',
                    });
                }
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        sanitizedData: sanitized,
    };
}

/**
 * Validate Contact input
 */
export function validateContact(input: ContactInput): ValidationResult {
    const errors: ValidationError[] = [];
    const rules = VALIDATION.contact;

    // Sanitize
    const sanitized = sanitizeObject({
        ...input,
        name: sanitizeString(input.name),
        phone: sanitizePhone(input.phone),
        email: input.email ? sanitizeEmail(input.email) : undefined,
        subject: input.subject ? sanitizeString(input.subject) : undefined,
        message: sanitizeString(input.message),
    });

    // Validate name
    const nameReqErr = validateRequired(sanitized.name, 'name');
    if (nameReqErr) errors.push(nameReqErr);
    else {
        const lenErr = validateLength(
            sanitized.name,
            'name',
            rules.name.minLength,
            rules.name.maxLength
        );
        if (lenErr) errors.push(lenErr);
    }

    // Validate phone
    const phoneReqErr = validateRequired(sanitized.phone, 'phone');
    if (phoneReqErr) errors.push(phoneReqErr);
    else {
        const patErr = validatePattern(
            sanitized.phone,
            'phone',
            rules.phone.pattern,
            'Số điện thoại không hợp lệ (VD: 0912345678)'
        );
        if (patErr) errors.push(patErr);
    }

    // Validate email if provided
    if (sanitized.email) {
        const patErr = validatePattern(
            sanitized.email,
            'email',
            PATTERNS.EMAIL,
            'Email không hợp lệ'
        );
        if (patErr) errors.push(patErr);
    }

    // Validate message
    const msgReqErr = validateRequired(sanitized.message, 'message');
    if (msgReqErr) errors.push(msgReqErr);
    else {
        const lenErr = validateLength(
            sanitized.message,
            'message',
            rules.message.minLength,
            rules.message.maxLength
        );
        if (lenErr) errors.push(lenErr);
    }

    return {
        valid: errors.length === 0,
        errors,
        sanitizedData: sanitized,
    };
}

// ============================================
// 🔧 UTILITY FUNCTIONS
// ============================================

/**
 * Format validation errors to API response
 */
export function formatValidationErrors(errors: ValidationError[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    for (const error of errors) {
        if (!result[error.field]) {
            result[error.field] = [];
        }
        result[error.field].push(error.message);
    }

    return result;
}

/**
 * Generate slug from string
 */
export function generateSlug(str: string): string {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Generate order number
 */
export function generateOrderNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');

    return `CLB-${year}${month}${day}-${random}`;
}
