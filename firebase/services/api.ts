/**
 * 🔥 FIREBASE API SERVICE
 * Production-ready API layer với:
 * - Validation
 * - Sanitization
 * - Transaction support
 * - Audit logging
 * - Error handling
 * - Realtime sync
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    Timestamp,
    runTransaction,
    onSnapshot,
    QueryConstraint,
    DocumentData,
    QuerySnapshot,
    DocumentReference,
    writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseAvailable } from '../config';
import {
    User, UserInput,
    Visitor, VisitorInput,
    Payment, PaymentInput,
    Schedule, ScheduleInput,
    Product, ProductInput,
    Order, OrderInput, OrderItem,
    Contact, ContactInput,
    AuditLog, LogAction, LogLevel,
    ApiResponse,
    PaginationParams,
    FilterParams,
    PaymentStatus,
    OrderStatus,
    PERMISSIONS,
    UserRole,
} from '../types/database';
import {
    validateUser,
    validateVisitor,
    validatePayment,
    validateSchedule,
    validateProduct,
    validateOrder,
    validateContact,
    formatValidationErrors,
    generateSlug,
    generateOrderNumber,
    sanitizeObject,
} from './validation';

// ============================================
// 🛠️ HELPER FUNCTIONS
// ============================================

/**
 * Check if Firebase is ready
 */
function checkDb(): void {
    if (!db || !isFirebaseAvailable()) {
        throw new Error('Firebase is not available');
    }
}

/**
 * Get current timestamp
 */
function now(): Timestamp {
    return Timestamp.now();
}

/**
 * Generate UUID
 */
function generateId(): string {
    return crypto.randomUUID ? crypto.randomUUID() :
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
}

/**
 * Create API response
 */
function createResponse<T>(
    success: boolean,
    data?: T,
    error?: { code: string; message: string; details?: Record<string, string[]> },
    meta?: { total?: number; page?: number; limit?: number; hasMore?: boolean }
): ApiResponse<T> {
    return {
        success,
        data,
        error,
        meta,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Check permission
 */
function hasPermission(role: UserRole, collection: string, action: string): boolean {
    const permissions = PERMISSIONS[role];
    if (!permissions) return false;

    const collectionPermissions = permissions[collection];
    if (!collectionPermissions) return false;

    return collectionPermissions.includes(action);
}

// ============================================
// 📝 AUDIT LOG SERVICE
// ============================================

export async function writeAuditLog(
    action: LogAction,
    collectionName: string,
    documentId?: string,
    oldData?: Record<string, any>,
    newData?: Record<string, any>,
    userId?: string,
    userEmail?: string,
    level: LogLevel = 'info',
    message?: string
): Promise<void> {
    try {
        checkDb();

        // Calculate changes
        let changes: Record<string, { old: any; new: any }> | undefined;
        if (oldData && newData) {
            changes = {};
            const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
            for (const key of allKeys) {
                if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
                    changes[key] = { old: oldData[key], new: newData[key] };
                }
            }
        }

        const log: Omit<AuditLog, 'id'> = {
            user_id: userId,
            user_email: userEmail,
            action,
            collection: collectionName,
            document_id: documentId,
            old_data: oldData,
            new_data: newData,
            changes,
            level,
            message,
            created_at: now(),
        };

        await addDoc(collection(db!, 'audit_logs'), log);
    } catch (error) {
        console.error('Failed to write audit log:', error);
    }
}

// ============================================
// 👥 USERS API
// ============================================

export const UsersAPI = {
    /**
     * Get all users (admin only)
     */
    async getAll(
        params?: PaginationParams & FilterParams,
        currentUserRole?: UserRole
    ): Promise<ApiResponse<User[]>> {
        try {
            checkDb();

            if (currentUserRole && !hasPermission(currentUserRole, 'users', 'read')) {
                return createResponse(false, undefined, {
                    code: 'FORBIDDEN',
                    message: 'Bạn không có quyền xem danh sách người dùng',
                });
            }

            const constraints: QueryConstraint[] = [];

            // Status filter
            if (params?.status) {
                constraints.push(where('status', '==', params.status));
            }

            // Soft delete filter
            constraints.push(where('deleted_at', '==', null));

            // Sorting
            constraints.push(orderBy(params?.sortBy || 'created_at', params?.sortOrder || 'desc'));

            // Pagination
            if (params?.limit) {
                constraints.push(limit(params.limit));
            }

            const q = query(collection(db!, 'users'), ...constraints);
            const snapshot = await getDocs(q);

            const users = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as User[];

            // Remove sensitive data
            const sanitizedUsers = users.map(({ password_hash, ...user }) => user);

            return createResponse(true, sanitizedUsers as User[], undefined, {
                total: snapshot.size,
                limit: params?.limit,
            });
        } catch (error: any) {
            return createResponse(false, undefined, {
                code: 'INTERNAL_ERROR',
                message: error.message || 'Lỗi khi lấy danh sách người dùng',
            });
        }
    },

    /**
     * Get user by ID
     */
    async getById(
        id: string,
        currentUserId?: string,
        currentUserRole?: UserRole
    ): Promise<ApiResponse<User>> {
        try {
            checkDb();

            // Members can only view their own profile
            if (currentUserRole === 'member' && currentUserId !== id) {
                return createResponse(false, undefined, {
                    code: 'FORBIDDEN',
                    message: 'Bạn không có quyền xem thông tin người dùng khác',
                });
            }

            const docRef = doc(db!, 'users', id);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return createResponse(false, undefined, {
                    code: 'NOT_FOUND',
                    message: 'Không tìm thấy người dùng',
                });
            }

            const userData = docSnap.data() as User;

            // Remove sensitive data
            const { password_hash, ...user } = userData;

            return createResponse(true, { id: docSnap.id, ...user } as User);
        } catch (error: any) {
            return createResponse(false, undefined, {
                code: 'INTERNAL_ERROR',
                message: error.message || 'Lỗi khi lấy thông tin người dùng',
            });
        }
    },

    /**
     * Create user
     */
    async create(
        input: UserInput,
        currentUserId?: string,
        currentUserRole?: UserRole
    ): Promise<ApiResponse<User>> {
        try {
            checkDb();

            if (currentUserRole && !hasPermission(currentUserRole, 'users', 'create')) {
                return createResponse(false, undefined, {
                    code: 'FORBIDDEN',
                    message: 'Bạn không có quyền tạo người dùng',
                });
            }

            // Validate
            const validation = validateUser(input);
            if (!validation.valid) {
                return createResponse(false, undefined, {
                    code: 'VALIDATION_ERROR',
                    message: 'Dữ liệu không hợp lệ',
                    details: formatValidationErrors(validation.errors),
                });
            }

            // Check email exists
            const emailQuery = query(
                collection(db!, 'users'),
                where('email', '==', validation.sanitizedData.email)
            );
            const emailCheck = await getDocs(emailQuery);
            if (!emailCheck.empty) {
                return createResponse(false, undefined, {
                    code: 'DUPLICATE_EMAIL',
                    message: 'Email đã được sử dụng',
                });
            }

            // Check phone exists
            const phoneQuery = query(
                collection(db!, 'users'),
                where('phone', '==', validation.sanitizedData.phone)
            );
            const phoneCheck = await getDocs(phoneQuery);
            if (!phoneCheck.empty) {
                return createResponse(false, undefined, {
                    code: 'DUPLICATE_PHONE',
                    message: 'Số điện thoại đã được sử dụng',
                });
            }

            const timestamp = now();
            const userData: Omit<User, 'id'> = {
                ...validation.sanitizedData,
                role: input.role || 'member',
                status: 'active',
                created_at: timestamp,
                updated_at: timestamp,
                created_by: currentUserId,
            };

            const docRef = await addDoc(collection(db!, 'users'), userData);

            // Log
            await writeAuditLog(
                'create',
                'users',
                docRef.id,
                undefined,
                userData,
                currentUserId
            );

            const { password_hash, ...user } = userData;
            return createResponse(true, { id: docRef.id, ...user } as User);
        } catch (error: any) {
            return createResponse(false, undefined, {
                code: 'INTERNAL_ERROR',
                message: error.message || 'Lỗi khi tạo người dùng',
            });
        }
    },

    /**
     * Update user
     */
    async update(
        id: string,
        input: Partial<UserInput>,
        currentUserId?: string,
        currentUserRole?: UserRole
    ): Promise<ApiResponse<User>> {
        try {
            checkDb();

            // Members can only update their own profile
            if (currentUserRole === 'member' && currentUserId !== id) {
                return createResponse(false, undefined, {
                    code: 'FORBIDDEN',
                    message: 'Bạn không có quyền cập nhật thông tin người dùng khác',
                });
            }

            // Validate
            const validation = validateUser(input as UserInput, true);
            if (!validation.valid) {
                return createResponse(false, undefined, {
                    code: 'VALIDATION_ERROR',
                    message: 'Dữ liệu không hợp lệ',
                    details: formatValidationErrors(validation.errors),
                });
            }

            const docRef = doc(db!, 'users', id);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return createResponse(false, undefined, {
                    code: 'NOT_FOUND',
                    message: 'Không tìm thấy người dùng',
                });
            }

            const oldData = docSnap.data();
            const updateData = {
                ...validation.sanitizedData,
                updated_at: now(),
                updated_by: currentUserId,
            };

            await updateDoc(docRef, updateData);

            // Log
            await writeAuditLog(
                'update',
                'users',
                id,
                oldData,
                { ...oldData, ...updateData },
                currentUserId
            );

            const newDocSnap = await getDoc(docRef);
            const { password_hash, ...user } = newDocSnap.data() as User;

            return createResponse(true, { id: newDocSnap.id, ...user } as User);
        } catch (error: any) {
            return createResponse(false, undefined, {
                code: 'INTERNAL_ERROR',
                message: error.message || 'Lỗi khi cập nhật người dùng',
            });
        }
    },

    /**
     * Soft delete user
     */
    async delete(
        id: string,
        currentUserId?: string,
        currentUserRole?: UserRole
    ): Promise<ApiResponse<void>> {
        try {
            checkDb();

            if (currentUserRole && !hasPermission(currentUserRole, 'users', 'delete')) {
                return createResponse(false, undefined, {
                    code: 'FORBIDDEN',
                    message: 'Bạn không có quyền xóa người dùng',
                });
            }

            const docRef = doc(db!, 'users', id);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return createResponse(false, undefined, {
                    code: 'NOT_FOUND',
                    message: 'Không tìm thấy người dùng',
                });
            }

            const oldData = docSnap.data();

            // Soft delete
            await updateDoc(docRef, {
                status: 'banned',
                deleted_at: now(),
                updated_by: currentUserId,
            });

            // Log
            await writeAuditLog(
                'delete',
                'users',
                id,
                oldData,
                undefined,
                currentUserId
            );

            return createResponse(true);
        } catch (error: any) {
            return createResponse(false, undefined, {
                code: 'INTERNAL_ERROR',
                message: error.message || 'Lỗi khi xóa người dùng',
            });
        }
    },

    /**
     * Subscribe to users (realtime)
     */
    subscribe(
        callback: (users: User[]) => void,
        onError?: (error: Error) => void
    ): () => void {
        if (!isFirebaseAvailable()) {
            onError?.(new Error('Firebase is not available'));
            return () => { };
        }

        const q = query(
            collection(db!, 'users'),
            where('deleted_at', '==', null),
            orderBy('created_at', 'desc')
        );

        return onSnapshot(
            q,
            (snapshot) => {
                const users = snapshot.docs.map(doc => {
                    const { password_hash, ...data } = doc.data();
                    return { id: doc.id, ...data } as User;
                });
                callback(users);
            },
            (error) => onError?.(error)
        );
    },
};

// ============================================
// 🏓 VISITORS API
// ============================================

export const VisitorsAPI = {
    /**
     * Get all visitors
     */
    async getAll(
        params?: PaginationParams & FilterParams,
        currentUserRole?: UserRole
    ): Promise<ApiResponse<Visitor[]>> {
        try {
            checkDb();

            if (currentUserRole && !hasPermission(currentUserRole, 'visitors', 'read')) {
                return createResponse(false, undefined, {
                    code: 'FORBIDDEN',
                    message: 'Bạn không có quyền xem danh sách khách',
                });
            }

            const constraints: QueryConstraint[] = [];

            // Date filter
            if (params?.startDate) {
                constraints.push(where('visit_date', '>=', Timestamp.fromDate(params.startDate)));
            }
            if (params?.endDate) {
                constraints.push(where('visit_date', '<=', Timestamp.fromDate(params.endDate)));
            }

            // Soft delete filter
            constraints.push(where('deleted_at', '==', null));

            // Sorting
            constraints.push(orderBy(params?.sortBy || 'visit_date', params?.sortOrder || 'desc'));

            // Pagination
            if (params?.limit) {
                constraints.push(limit(params.limit));
            }

            const q = query(collection(db!, 'visitors'), ...constraints);
            const snapshot = await getDocs(q);

            const visitors = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Visitor[];

            return createResponse(true, visitors, undefined, {
                total: snapshot.size,
                limit: params?.limit,
            });
        } catch (error: any) {
            return createResponse(false, undefined, {
                code: 'INTERNAL_ERROR',
                message: error.message || 'Lỗi khi lấy danh sách khách',
            });
        }
    },

    /**
     * Create visitor with payment (transaction)
     */
    async create(
        input: VisitorInput,
        currentUserId?: string,
        currentUserRole?: UserRole
    ): Promise<ApiResponse<Visitor>> {
        try {
            checkDb();

            if (currentUserRole && !hasPermission(currentUserRole, 'visitors', 'create')) {
                return createResponse(false, undefined, {
                    code: 'FORBIDDEN',
                    message: 'Bạn không có quyền thêm khách',
                });
            }

            // Validate
            const validation = validateVisitor(input);
            if (!validation.valid) {
                return createResponse(false, undefined, {
                    code: 'VALIDATION_ERROR',
                    message: 'Dữ liệu không hợp lệ',
                    details: formatValidationErrors(validation.errors),
                });
            }

            // Use transaction to create visitor and payment together
            const result = await runTransaction(db!, async (transaction) => {
                const timestamp = now();
                const visitorId = generateId();
                const visitorRef = doc(db!, 'visitors', visitorId);

                const visitorData: Visitor = {
                    id: visitorId,
                    user_id: validation.sanitizedData.user_id || null,
                    visitor_name: validation.sanitizedData.visitor_name,
                    visitor_phone: validation.sanitizedData.visitor_phone,
                    visit_date: Timestamp.fromDate(validation.sanitizedData.visit_date),
                    check_in_time: Timestamp.fromDate(validation.sanitizedData.check_in_time),
                    check_out_time: validation.sanitizedData.check_out_time
                        ? Timestamp.fromDate(validation.sanitizedData.check_out_time)
                        : undefined,
                    play_type: validation.sanitizedData.play_type,
                    table_number: validation.sanitizedData.table_number,
                    price: validation.sanitizedData.price,
                    payment_method: validation.sanitizedData.payment_method,
                    payment_status: 'pending',
                    note: validation.sanitizedData.note,
                    created_at: timestamp,
                    updated_at: timestamp,
                    created_by: currentUserId!,
                };

                transaction.set(visitorRef, visitorData);

                // Create payment record
                const paymentId = generateId();
                const paymentRef = doc(db!, 'payments', paymentId);

                const paymentData: Payment = {
                    id: paymentId,
                    reference_id: visitorId,
                    reference_type: 'visitor',
                    user_id: validation.sanitizedData.user_id || undefined,
                    amount: validation.sanitizedData.price,
                    payment_method: validation.sanitizedData.payment_method,
                    payment_status: 'pending',
                    created_at: timestamp,
                    updated_at: timestamp,
                    created_by: currentUserId!,
                };

                transaction.set(paymentRef, paymentData);

                return visitorData;
            });

            // Log
            await writeAuditLog(
                'create',
                'visitors',
                result.id,
                undefined,
                result,
                currentUserId
            );

            return createResponse(true, result);
        } catch (error: any) {
            return createResponse(false, undefined, {
                code: 'INTERNAL_ERROR',
                message: error.message || 'Lỗi khi thêm khách',
            });
        }
    },

    /**
     * Subscribe to visitors (realtime)
     */
    subscribe(
        callback: (visitors: Visitor[]) => void,
        onError?: (error: Error) => void,
        dateFilter?: Date
    ): () => void {
        if (!isFirebaseAvailable()) {
            onError?.(new Error('Firebase is not available'));
            return () => { };
        }

        const constraints: QueryConstraint[] = [
            where('deleted_at', '==', null),
            orderBy('check_in_time', 'desc'),
        ];

        if (dateFilter) {
            const startOfDay = new Date(dateFilter);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(dateFilter);
            endOfDay.setHours(23, 59, 59, 999);

            constraints.unshift(
                where('visit_date', '>=', Timestamp.fromDate(startOfDay)),
                where('visit_date', '<=', Timestamp.fromDate(endOfDay))
            );
        }

        const q = query(collection(db!, 'visitors'), ...constraints);

        return onSnapshot(
            q,
            (snapshot) => {
                const visitors = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Visitor[];
                callback(visitors);
            },
            (error) => onError?.(error)
        );
    },
};

// ============================================
// 🧾 PAYMENTS API
// ============================================

export const PaymentsAPI = {
    /**
     * Get all payments
     */
    async getAll(
        params?: PaginationParams & FilterParams,
        currentUserRole?: UserRole
    ): Promise<ApiResponse<Payment[]>> {
        try {
            checkDb();

            if (currentUserRole && !hasPermission(currentUserRole, 'payments', 'read')) {
                return createResponse(false, undefined, {
                    code: 'FORBIDDEN',
                    message: 'Bạn không có quyền xem thanh toán',
                });
            }

            const constraints: QueryConstraint[] = [];

            // Status filter
            if (params?.status) {
                constraints.push(where('payment_status', '==', params.status));
            }

            // Soft delete filter
            constraints.push(where('deleted_at', '==', null));

            // Sorting
            constraints.push(orderBy(params?.sortBy || 'created_at', params?.sortOrder || 'desc'));

            // Pagination
            if (params?.limit) {
                constraints.push(limit(params.limit));
            }

            const q = query(collection(db!, 'payments'), ...constraints);
            const snapshot = await getDocs(q);

            const payments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Payment[];

            return createResponse(true, payments, undefined, {
                total: snapshot.size,
                limit: params?.limit,
            });
        } catch (error: any) {
            return createResponse(false, undefined, {
                code: 'INTERNAL_ERROR',
                message: error.message || 'Lỗi khi lấy danh sách thanh toán',
            });
        }
    },

    /**
     * Confirm payment (transaction)
     */
    async confirm(
        paymentId: string,
        transactionId?: string,
        currentUserId?: string,
        currentUserRole?: UserRole
    ): Promise<ApiResponse<Payment>> {
        try {
            checkDb();

            if (currentUserRole && !hasPermission(currentUserRole, 'payments', 'update')) {
                return createResponse(false, undefined, {
                    code: 'FORBIDDEN',
                    message: 'Bạn không có quyền xác nhận thanh toán',
                });
            }

            const result = await runTransaction(db!, async (transaction) => {
                const paymentRef = doc(db!, 'payments', paymentId);
                const paymentSnap = await transaction.get(paymentRef);

                if (!paymentSnap.exists()) {
                    throw new Error('Không tìm thấy thanh toán');
                }

                const paymentData = paymentSnap.data() as Payment;

                if (paymentData.payment_status === 'paid') {
                    throw new Error('Thanh toán đã được xác nhận');
                }

                const timestamp = now();
                const updateData = {
                    payment_status: 'paid' as PaymentStatus,
                    payment_time: timestamp,
                    transaction_id: transactionId,
                    updated_at: timestamp,
                    updated_by: currentUserId,
                };

                transaction.update(paymentRef, updateData);

                // Update related visitor/order payment status
                if (paymentData.reference_type === 'visitor') {
                    const visitorRef = doc(db!, 'visitors', paymentData.reference_id);
                    transaction.update(visitorRef, {
                        payment_status: 'paid',
                        updated_at: timestamp,
                    });
                } else if (paymentData.reference_type === 'order') {
                    const orderRef = doc(db!, 'orders', paymentData.reference_id);
                    transaction.update(orderRef, {
                        payment_status: 'paid',
                        updated_at: timestamp,
                    });
                }

                return { ...paymentData, ...updateData };
            });

            // Log
            await writeAuditLog(
                'update',
                'payments',
                paymentId,
                undefined,
                result,
                currentUserId,
                undefined,
                'info',
                'Payment confirmed'
            );

            return createResponse(true, result);
        } catch (error: any) {
            return createResponse(false, undefined, {
                code: 'INTERNAL_ERROR',
                message: error.message || 'Lỗi khi xác nhận thanh toán',
            });
        }
    },

    /**
     * Subscribe to payments (realtime)
     */
    subscribe(
        callback: (payments: Payment[]) => void,
        onError?: (error: Error) => void
    ): () => void {
        if (!isFirebaseAvailable()) {
            onError?.(new Error('Firebase is not available'));
            return () => { };
        }

        const q = query(
            collection(db!, 'payments'),
            where('deleted_at', '==', null),
            orderBy('created_at', 'desc'),
            limit(100)
        );

        return onSnapshot(
            q,
            (snapshot) => {
                const payments = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Payment[];
                callback(payments);
            },
            (error) => onError?.(error)
        );
    },
};

// ============================================
// 📅 SCHEDULES API
// ============================================

export const SchedulesAPI = {
    /**
     * Get all schedules
     */
    async getAll(
        params?: PaginationParams & FilterParams
    ): Promise<ApiResponse<Schedule[]>> {
        try {
            checkDb();

            const constraints: QueryConstraint[] = [];

            // Status filter
            if (params?.status) {
                constraints.push(where('status', '==', params.status));
            } else {
                constraints.push(where('status', '==', 'active'));
            }

            // Soft delete filter
            constraints.push(where('deleted_at', '==', null));

            // Sorting
            constraints.push(orderBy(params?.sortBy || 'day_of_week', params?.sortOrder || 'asc'));

            const q = query(collection(db!, 'schedules'), ...constraints);
            const snapshot = await getDocs(q);

            const schedules = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Schedule[];

            return createResponse(true, schedules, undefined, {
                total: snapshot.size,
            });
        } catch (error: any) {
            return createResponse(false, undefined, {
                code: 'INTERNAL_ERROR',
                message: error.message || 'Lỗi khi lấy lịch tập',
            });
        }
    },

    /**
     * Create schedule
     */
    async create(
        input: ScheduleInput,
        currentUserId?: string,
        currentUserRole?: UserRole
    ): Promise<ApiResponse<Schedule>> {
        try {
            checkDb();

            if (currentUserRole && !hasPermission(currentUserRole, 'schedules', 'create')) {
                return createResponse(false, undefined, {
                    code: 'FORBIDDEN',
                    message: 'Bạn không có quyền tạo lịch tập',
                });
            }

            // Validate
            const validation = validateSchedule(input);
            if (!validation.valid) {
                return createResponse(false, undefined, {
                    code: 'VALIDATION_ERROR',
                    message: 'Dữ liệu không hợp lệ',
                    details: formatValidationErrors(validation.errors),
                });
            }

            const timestamp = now();
            const scheduleData: Omit<Schedule, 'id'> = {
                ...validation.sanitizedData,
                current_participants: 0,
                status: 'active',
                created_at: timestamp,
                updated_at: timestamp,
                created_by: currentUserId!,
            };

            const docRef = await addDoc(collection(db!, 'schedules'), scheduleData);

            // Log
            await writeAuditLog(
                'create',
                'schedules',
                docRef.id,
                undefined,
                scheduleData,
                currentUserId
            );

            return createResponse(true, { id: docRef.id, ...scheduleData } as Schedule);
        } catch (error: any) {
            return createResponse(false, undefined, {
                code: 'INTERNAL_ERROR',
                message: error.message || 'Lỗi khi tạo lịch tập',
            });
        }
    },

    /**
     * Subscribe to schedules (realtime)
     */
    subscribe(
        callback: (schedules: Schedule[]) => void,
        onError?: (error: Error) => void
    ): () => void {
        if (!isFirebaseAvailable()) {
            onError?.(new Error('Firebase is not available'));
            return () => { };
        }

        const q = query(
            collection(db!, 'schedules'),
            where('status', '==', 'active'),
            where('deleted_at', '==', null),
            orderBy('day_of_week', 'asc')
        );

        return onSnapshot(
            q,
            (snapshot) => {
                const schedules = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Schedule[];
                callback(schedules);
            },
            (error) => onError?.(error)
        );
    },
};

// ============================================
// 🛒 PRODUCTS API
// ============================================

export const ProductsAPI = {
    /**
     * Get all products
     */
    async getAll(
        params?: PaginationParams & FilterParams
    ): Promise<ApiResponse<Product[]>> {
        try {
            checkDb();

            const constraints: QueryConstraint[] = [];

            // Category filter
            if (params?.category) {
                constraints.push(where('category', '==', params.category));
            }

            // Status filter
            if (params?.status) {
                constraints.push(where('status', '==', params.status));
            } else {
                constraints.push(where('status', '==', 'active'));
            }

            // Soft delete filter
            constraints.push(where('deleted_at', '==', null));

            // Sorting
            constraints.push(orderBy(params?.sortBy || 'created_at', params?.sortOrder || 'desc'));

            // Pagination
            if (params?.limit) {
                constraints.push(limit(params.limit));
            }

            const q = query(collection(db!, 'products'), ...constraints);
            const snapshot = await getDocs(q);

            const products = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Product[];

            return createResponse(true, products, undefined, {
                total: snapshot.size,
                limit: params?.limit,
            });
        } catch (error: any) {
            return createResponse(false, undefined, {
                code: 'INTERNAL_ERROR',
                message: error.message || 'Lỗi khi lấy sản phẩm',
            });
        }
    },

    /**
     * Create product
     */
    async create(
        input: ProductInput,
        currentUserId?: string,
        currentUserRole?: UserRole
    ): Promise<ApiResponse<Product>> {
        try {
            checkDb();

            if (currentUserRole && !hasPermission(currentUserRole, 'products', 'create')) {
                return createResponse(false, undefined, {
                    code: 'FORBIDDEN',
                    message: 'Bạn không có quyền tạo sản phẩm',
                });
            }

            // Validate
            const validation = validateProduct(input);
            if (!validation.valid) {
                return createResponse(false, undefined, {
                    code: 'VALIDATION_ERROR',
                    message: 'Dữ liệu không hợp lệ',
                    details: formatValidationErrors(validation.errors),
                });
            }

            const timestamp = now();
            const productData: Omit<Product, 'id'> = {
                ...validation.sanitizedData,
                slug: generateSlug(validation.sanitizedData.name),
                status: 'active',
                featured: input.featured || false,
                review_count: 0,
                sold_count: 0,
                created_at: timestamp,
                updated_at: timestamp,
                created_by: currentUserId!,
            };

            const docRef = await addDoc(collection(db!, 'products'), productData);

            // Log
            await writeAuditLog(
                'create',
                'products',
                docRef.id,
                undefined,
                productData,
                currentUserId
            );

            return createResponse(true, { id: docRef.id, ...productData } as Product);
        } catch (error: any) {
            return createResponse(false, undefined, {
                code: 'INTERNAL_ERROR',
                message: error.message || 'Lỗi khi tạo sản phẩm',
            });
        }
    },

    /**
     * Subscribe to products (realtime)
     */
    subscribe(
        callback: (products: Product[]) => void,
        onError?: (error: Error) => void
    ): () => void {
        if (!isFirebaseAvailable()) {
            onError?.(new Error('Firebase is not available'));
            return () => { };
        }

        const q = query(
            collection(db!, 'products'),
            where('status', '==', 'active'),
            where('deleted_at', '==', null),
            orderBy('created_at', 'desc')
        );

        return onSnapshot(
            q,
            (snapshot) => {
                const products = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Product[];
                callback(products);
            },
            (error) => onError?.(error)
        );
    },
};

// ============================================
// 📦 ORDERS API
// ============================================

export const OrdersAPI = {
    /**
     * Get all orders
     */
    async getAll(
        params?: PaginationParams & FilterParams,
        currentUserId?: string,
        currentUserRole?: UserRole
    ): Promise<ApiResponse<Order[]>> {
        try {
            checkDb();

            if (currentUserRole && !hasPermission(currentUserRole, 'orders', 'read')) {
                return createResponse(false, undefined, {
                    code: 'FORBIDDEN',
                    message: 'Bạn không có quyền xem đơn hàng',
                });
            }

            const constraints: QueryConstraint[] = [];

            // Members can only see their own orders
            if (currentUserRole === 'member' && currentUserId) {
                constraints.push(where('user_id', '==', currentUserId));
            }

            // Status filter
            if (params?.status) {
                constraints.push(where('order_status', '==', params.status));
            }

            // Soft delete filter
            constraints.push(where('deleted_at', '==', null));

            // Sorting
            constraints.push(orderBy(params?.sortBy || 'created_at', params?.sortOrder || 'desc'));

            // Pagination
            if (params?.limit) {
                constraints.push(limit(params.limit));
            }

            const q = query(collection(db!, 'orders'), ...constraints);
            const snapshot = await getDocs(q);

            const orders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Order[];

            return createResponse(true, orders, undefined, {
                total: snapshot.size,
                limit: params?.limit,
            });
        } catch (error: any) {
            return createResponse(false, undefined, {
                code: 'INTERNAL_ERROR',
                message: error.message || 'Lỗi khi lấy đơn hàng',
            });
        }
    },

    /**
     * Create order with stock update (transaction)
     */
    async create(
        input: OrderInput,
        currentUserId: string,
        currentUserRole?: UserRole
    ): Promise<ApiResponse<Order>> {
        try {
            checkDb();

            if (currentUserRole && !hasPermission(currentUserRole, 'orders', 'create')) {
                return createResponse(false, undefined, {
                    code: 'FORBIDDEN',
                    message: 'Bạn không có quyền tạo đơn hàng',
                });
            }

            // Validate
            const validation = validateOrder(input);
            if (!validation.valid) {
                return createResponse(false, undefined, {
                    code: 'VALIDATION_ERROR',
                    message: 'Dữ liệu không hợp lệ',
                    details: formatValidationErrors(validation.errors),
                });
            }

            // Use transaction to create order and update stock
            const result = await runTransaction(db!, async (transaction) => {
                const timestamp = now();
                const orderId = generateId();
                const orderRef = doc(db!, 'orders', orderId);

                // Get products and check stock
                const orderItems: OrderItem[] = [];
                let subtotal = 0;

                for (const item of input.items) {
                    const productRef = doc(db!, 'products', item.product_id);
                    const productSnap = await transaction.get(productRef);

                    if (!productSnap.exists()) {
                        throw new Error(`Sản phẩm ${item.product_id} không tồn tại`);
                    }

                    const product = productSnap.data() as Product;

                    if (product.stock < item.quantity) {
                        throw new Error(`Sản phẩm "${product.name}" chỉ còn ${product.stock} sản phẩm`);
                    }

                    // Create order item
                    orderItems.push({
                        id: generateId(),
                        product_id: item.product_id,
                        product_name: product.name,
                        product_image: product.image_url,
                        quantity: item.quantity,
                        unit_price: product.price,
                        total_price: product.price * item.quantity,
                    });

                    subtotal += product.price * item.quantity;

                    // Update stock
                    transaction.update(productRef, {
                        stock: product.stock - item.quantity,
                        sold_count: (product.sold_count || 0) + item.quantity,
                        updated_at: timestamp,
                    });
                }

                const totalPrice = subtotal + (input.shipping_fee || 0) - (input.discount || 0);

                const orderData: Order = {
                    id: orderId,
                    order_number: generateOrderNumber(),
                    user_id: currentUserId,
                    customer_name: validation.sanitizedData.customer_name,
                    customer_phone: validation.sanitizedData.customer_phone,
                    customer_email: validation.sanitizedData.customer_email,
                    shipping_address: validation.sanitizedData.shipping_address,
                    items: orderItems,
                    subtotal,
                    shipping_fee: input.shipping_fee || 0,
                    discount: input.discount || 0,
                    total_price: totalPrice,
                    payment_method: input.payment_method,
                    payment_status: 'pending',
                    order_status: 'pending',
                    note: validation.sanitizedData.note,
                    created_at: timestamp,
                    updated_at: timestamp,
                    created_by: currentUserId,
                };

                transaction.set(orderRef, orderData);

                // Create payment record
                const paymentId = generateId();
                const paymentRef = doc(db!, 'payments', paymentId);

                const paymentData: Payment = {
                    id: paymentId,
                    reference_id: orderId,
                    reference_type: 'order',
                    user_id: currentUserId,
                    amount: totalPrice,
                    payment_method: input.payment_method,
                    payment_status: 'pending',
                    created_at: timestamp,
                    updated_at: timestamp,
                    created_by: currentUserId,
                };

                transaction.set(paymentRef, paymentData);

                return orderData;
            });

            // Log
            await writeAuditLog(
                'create',
                'orders',
                result.id,
                undefined,
                result,
                currentUserId,
                undefined,
                'info',
                `Order ${result.order_number} created`
            );

            return createResponse(true, result);
        } catch (error: any) {
            return createResponse(false, undefined, {
                code: 'INTERNAL_ERROR',
                message: error.message || 'Lỗi khi tạo đơn hàng',
            });
        }
    },

    /**
     * Update order status
     */
    async updateStatus(
        orderId: string,
        status: OrderStatus,
        currentUserId?: string,
        currentUserRole?: UserRole
    ): Promise<ApiResponse<Order>> {
        try {
            checkDb();

            if (currentUserRole && !hasPermission(currentUserRole, 'orders', 'update')) {
                return createResponse(false, undefined, {
                    code: 'FORBIDDEN',
                    message: 'Bạn không có quyền cập nhật đơn hàng',
                });
            }

            const orderRef = doc(db!, 'orders', orderId);
            const orderSnap = await getDoc(orderRef);

            if (!orderSnap.exists()) {
                return createResponse(false, undefined, {
                    code: 'NOT_FOUND',
                    message: 'Không tìm thấy đơn hàng',
                });
            }

            const oldData = orderSnap.data();
            const timestamp = now();
            const updateData: any = {
                order_status: status,
                updated_at: timestamp,
                updated_by: currentUserId,
            };

            // Add specific timestamps based on status
            if (status === 'shipping') updateData.shipped_at = timestamp;
            if (status === 'delivered') updateData.delivered_at = timestamp;
            if (status === 'cancelled') updateData.cancelled_at = timestamp;

            await updateDoc(orderRef, updateData);

            // Log
            await writeAuditLog(
                'update',
                'orders',
                orderId,
                oldData,
                { ...oldData, ...updateData },
                currentUserId,
                undefined,
                'info',
                `Order status updated to ${status}`
            );

            const newSnap = await getDoc(orderRef);
            return createResponse(true, { id: newSnap.id, ...newSnap.data() } as Order);
        } catch (error: any) {
            return createResponse(false, undefined, {
                code: 'INTERNAL_ERROR',
                message: error.message || 'Lỗi khi cập nhật đơn hàng',
            });
        }
    },

    /**
     * Cancel order with stock restore (transaction)
     */
    async cancel(
        orderId: string,
        reason: string,
        currentUserId?: string,
        currentUserRole?: UserRole
    ): Promise<ApiResponse<Order>> {
        try {
            checkDb();

            if (currentUserRole && !hasPermission(currentUserRole, 'orders', 'update')) {
                return createResponse(false, undefined, {
                    code: 'FORBIDDEN',
                    message: 'Bạn không có quyền hủy đơn hàng',
                });
            }

            const result = await runTransaction(db!, async (transaction) => {
                const orderRef = doc(db!, 'orders', orderId);
                const orderSnap = await transaction.get(orderRef);

                if (!orderSnap.exists()) {
                    throw new Error('Không tìm thấy đơn hàng');
                }

                const order = orderSnap.data() as Order;

                if (order.order_status === 'cancelled') {
                    throw new Error('Đơn hàng đã bị hủy');
                }

                if (order.order_status === 'delivered') {
                    throw new Error('Không thể hủy đơn hàng đã giao');
                }

                const timestamp = now();

                // Restore stock for each item
                for (const item of order.items) {
                    const productRef = doc(db!, 'products', item.product_id);
                    const productSnap = await transaction.get(productRef);

                    if (productSnap.exists()) {
                        const product = productSnap.data() as Product;
                        transaction.update(productRef, {
                            stock: product.stock + item.quantity,
                            sold_count: Math.max(0, (product.sold_count || 0) - item.quantity),
                            updated_at: timestamp,
                        });
                    }
                }

                // Update order
                const updateData = {
                    order_status: 'cancelled' as OrderStatus,
                    cancelled_at: timestamp,
                    cancel_reason: reason,
                    updated_at: timestamp,
                    updated_by: currentUserId,
                };

                transaction.update(orderRef, updateData);

                // Update payment
                const paymentsQuery = query(
                    collection(db!, 'payments'),
                    where('reference_id', '==', orderId),
                    where('reference_type', '==', 'order')
                );
                const paymentsSnap = await getDocs(paymentsQuery);

                for (const paymentDoc of paymentsSnap.docs) {
                    transaction.update(paymentDoc.ref, {
                        payment_status: 'cancelled',
                        updated_at: timestamp,
                    });
                }

                return { ...order, ...updateData };
            });

            // Log
            await writeAuditLog(
                'update',
                'orders',
                orderId,
                undefined,
                result,
                currentUserId,
                undefined,
                'warning',
                `Order cancelled: ${reason}`
            );

            return createResponse(true, result);
        } catch (error: any) {
            return createResponse(false, undefined, {
                code: 'INTERNAL_ERROR',
                message: error.message || 'Lỗi khi hủy đơn hàng',
            });
        }
    },

    /**
     * Subscribe to orders (realtime)
     */
    subscribe(
        callback: (orders: Order[]) => void,
        onError?: (error: Error) => void,
        userId?: string
    ): () => void {
        if (!isFirebaseAvailable()) {
            onError?.(new Error('Firebase is not available'));
            return () => { };
        }

        const constraints: QueryConstraint[] = [
            where('deleted_at', '==', null),
            orderBy('created_at', 'desc'),
            limit(100),
        ];

        if (userId) {
            constraints.unshift(where('user_id', '==', userId));
        }

        const q = query(collection(db!, 'orders'), ...constraints);

        return onSnapshot(
            q,
            (snapshot) => {
                const orders = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Order[];
                callback(orders);
            },
            (error) => onError?.(error)
        );
    },
};

// ============================================
// 📋 CONTACTS API
// ============================================

export const ContactsAPI = {
    /**
     * Get all contacts
     */
    async getAll(
        params?: PaginationParams & FilterParams,
        currentUserRole?: UserRole
    ): Promise<ApiResponse<Contact[]>> {
        try {
            checkDb();

            if (currentUserRole && !hasPermission(currentUserRole, 'contacts', 'read')) {
                return createResponse(false, undefined, {
                    code: 'FORBIDDEN',
                    message: 'Bạn không có quyền xem liên hệ',
                });
            }

            const constraints: QueryConstraint[] = [];

            // Status filter
            if (params?.status) {
                constraints.push(where('status', '==', params.status));
            }

            // Soft delete filter
            constraints.push(where('deleted_at', '==', null));

            // Sorting
            constraints.push(orderBy(params?.sortBy || 'created_at', params?.sortOrder || 'desc'));

            // Pagination
            if (params?.limit) {
                constraints.push(limit(params.limit));
            }

            const q = query(collection(db!, 'contacts'), ...constraints);
            const snapshot = await getDocs(q);

            const contacts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Contact[];

            return createResponse(true, contacts, undefined, {
                total: snapshot.size,
                limit: params?.limit,
            });
        } catch (error: any) {
            return createResponse(false, undefined, {
                code: 'INTERNAL_ERROR',
                message: error.message || 'Lỗi khi lấy liên hệ',
            });
        }
    },

    /**
     * Create contact (public - no auth required)
     */
    async create(input: ContactInput): Promise<ApiResponse<Contact>> {
        try {
            checkDb();

            // Validate
            const validation = validateContact(input);
            if (!validation.valid) {
                return createResponse(false, undefined, {
                    code: 'VALIDATION_ERROR',
                    message: 'Dữ liệu không hợp lệ',
                    details: formatValidationErrors(validation.errors),
                });
            }

            const timestamp = now();
            const contactData: Omit<Contact, 'id'> = {
                ...validation.sanitizedData,
                contact_type: input.contact_type || 'general',
                status: 'new',
                created_at: timestamp,
                updated_at: timestamp,
            };

            const docRef = await addDoc(collection(db!, 'contacts'), contactData);

            // Log (no user)
            await writeAuditLog(
                'create',
                'contacts',
                docRef.id,
                undefined,
                contactData,
                undefined,
                undefined,
                'info',
                'New contact form submitted'
            );

            return createResponse(true, { id: docRef.id, ...contactData } as Contact);
        } catch (error: any) {
            return createResponse(false, undefined, {
                code: 'INTERNAL_ERROR',
                message: error.message || 'Lỗi khi gửi liên hệ',
            });
        }
    },

    /**
     * Mark contact as read
     */
    async markAsRead(
        contactId: string,
        currentUserId?: string,
        currentUserRole?: UserRole
    ): Promise<ApiResponse<Contact>> {
        try {
            checkDb();

            if (currentUserRole && !hasPermission(currentUserRole, 'contacts', 'update')) {
                return createResponse(false, undefined, {
                    code: 'FORBIDDEN',
                    message: 'Bạn không có quyền cập nhật liên hệ',
                });
            }

            const docRef = doc(db!, 'contacts', contactId);
            await updateDoc(docRef, {
                status: 'read',
                updated_at: now(),
            });

            const newSnap = await getDoc(docRef);
            return createResponse(true, { id: newSnap.id, ...newSnap.data() } as Contact);
        } catch (error: any) {
            return createResponse(false, undefined, {
                code: 'INTERNAL_ERROR',
                message: error.message || 'Lỗi khi cập nhật liên hệ',
            });
        }
    },

    /**
     * Subscribe to contacts (realtime)
     */
    subscribe(
        callback: (contacts: Contact[]) => void,
        onError?: (error: Error) => void
    ): () => void {
        if (!isFirebaseAvailable()) {
            onError?.(new Error('Firebase is not available'));
            return () => { };
        }

        const q = query(
            collection(db!, 'contacts'),
            where('deleted_at', '==', null),
            orderBy('created_at', 'desc'),
            limit(100)
        );

        return onSnapshot(
            q,
            (snapshot) => {
                const contacts = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Contact[];
                callback(contacts);
            },
            (error) => onError?.(error)
        );
    },
};

// ============================================
// 📊 STATS API
// ============================================

export const StatsAPI = {
    /**
     * Get dashboard stats
     */
    async getDashboardStats(): Promise<ApiResponse<{
        totalVisitors: number;
        totalRevenue: number;
        totalOrders: number;
        pendingOrders: number;
        newContacts: number;
        activeProducts: number;
    }>> {
        try {
            checkDb();

            // Get today's visitors
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const visitorsQuery = query(
                collection(db!, 'visitors'),
                where('visit_date', '>=', Timestamp.fromDate(today)),
                where('deleted_at', '==', null)
            );
            const visitorsSnap = await getDocs(visitorsQuery);

            // Get today's revenue
            const paymentsQuery = query(
                collection(db!, 'payments'),
                where('payment_status', '==', 'paid'),
                where('created_at', '>=', Timestamp.fromDate(today))
            );
            const paymentsSnap = await getDocs(paymentsQuery);
            let totalRevenue = 0;
            paymentsSnap.forEach(doc => {
                totalRevenue += doc.data().amount || 0;
            });

            // Get pending orders
            const ordersQuery = query(
                collection(db!, 'orders'),
                where('order_status', '==', 'pending'),
                where('deleted_at', '==', null)
            );
            const ordersSnap = await getDocs(ordersQuery);

            // Get new contacts
            const contactsQuery = query(
                collection(db!, 'contacts'),
                where('status', '==', 'new'),
                where('deleted_at', '==', null)
            );
            const contactsSnap = await getDocs(contactsQuery);

            // Get active products
            const productsQuery = query(
                collection(db!, 'products'),
                where('status', '==', 'active'),
                where('deleted_at', '==', null)
            );
            const productsSnap = await getDocs(productsQuery);

            // Get total orders today
            const allOrdersQuery = query(
                collection(db!, 'orders'),
                where('created_at', '>=', Timestamp.fromDate(today)),
                where('deleted_at', '==', null)
            );
            const allOrdersSnap = await getDocs(allOrdersQuery);

            return createResponse(true, {
                totalVisitors: visitorsSnap.size,
                totalRevenue,
                totalOrders: allOrdersSnap.size,
                pendingOrders: ordersSnap.size,
                newContacts: contactsSnap.size,
                activeProducts: productsSnap.size,
            });
        } catch (error: any) {
            return createResponse(false, undefined, {
                code: 'INTERNAL_ERROR',
                message: error.message || 'Lỗi khi lấy thống kê',
            });
        }
    },
};

// ============================================
// 📤 EXPORT ALL APIs
// ============================================

export const API = {
    users: UsersAPI,
    visitors: VisitorsAPI,
    payments: PaymentsAPI,
    schedules: SchedulesAPI,
    products: ProductsAPI,
    orders: OrdersAPI,
    contacts: ContactsAPI,
    stats: StatsAPI,
    log: writeAuditLog,
};

export default API;
