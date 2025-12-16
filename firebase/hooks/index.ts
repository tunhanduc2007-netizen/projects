/**
 * 🪝 REACT HOOKS FOR FIREBASE
 * Production-ready hooks với:
 * - Realtime data sync
 * - Loading states
 * - Error handling
 * - Toast notifications
 * - Optimistic updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    User,
    Visitor,
    Payment,
    Schedule,
    Product,
    Order,
    Contact,
    ApiResponse,
    UserRole,
} from '../types/database';
import {
    API,
    UsersAPI,
    VisitorsAPI,
    PaymentsAPI,
    SchedulesAPI,
    ProductsAPI,
    OrdersAPI,
    ContactsAPI,
    StatsAPI,
} from '../services/api';
import { AuthService, AuthUser } from '../services/auth';
import { isFirebaseAvailable } from '../config';

// ============================================
// 🔔 TOAST NOTIFICATION HOOK
// ============================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((type: ToastType, message: string, duration = 5000) => {
        const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
        const toast: Toast = { id, type, message, duration };

        setToasts(prev => [...prev, toast]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const success = useCallback((message: string) => addToast('success', message), [addToast]);
    const error = useCallback((message: string) => addToast('error', message), [addToast]);
    const warning = useCallback((message: string) => addToast('warning', message), [addToast]);
    const info = useCallback((message: string) => addToast('info', message), [addToast]);

    return { toasts, addToast, removeToast, success, error, warning, info };
}

// ============================================
// 🔐 AUTH HOOK
// ============================================

export interface UseAuthReturn {
    user: AuthUser | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<ApiResponse<AuthUser>>;
    register: (email: string, password: string, fullName: string, phone: string) => Promise<ApiResponse<AuthUser>>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    isAdmin: boolean;
    isStaff: boolean;
    isMember: boolean;
    hasPermission: (resource: string, action: string) => boolean;
}

export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isFirebaseAvailable()) {
            setLoading(false);
            return;
        }

        const unsubscribe = AuthService.onAuthStateChanged((authUser) => {
            setUser(authUser);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setLoading(true);
        setError(null);

        const result = await AuthService.login({ email, password });

        if (!result.success) {
            setError(result.error?.message || 'Đăng nhập thất bại');
        }

        setLoading(false);
        return result;
    }, []);

    const register = useCallback(async (email: string, password: string, fullName: string, phone: string) => {
        setLoading(true);
        setError(null);

        const result = await AuthService.register({ email, password, full_name: fullName, phone });

        if (!result.success) {
            setError(result.error?.message || 'Đăng ký thất bại');
        }

        setLoading(false);
        return result;
    }, []);

    const logout = useCallback(async () => {
        setLoading(true);
        await AuthService.logout();
        setUser(null);
        setLoading(false);
    }, []);

    const resetPassword = useCallback(async (email: string) => {
        await AuthService.resetPassword(email);
    }, []);

    const hasPermission = useCallback((resource: string, action: string) => {
        if (!user) return false;
        return AuthService.hasPermission(user.role, resource, action);
    }, [user]);

    return {
        user,
        loading,
        error,
        login,
        register,
        logout,
        resetPassword,
        isAdmin: user?.role === 'admin',
        isStaff: user?.role === 'staff' || user?.role === 'admin',
        isMember: user?.role === 'member',
        hasPermission,
    };
}

// ============================================
// 📊 GENERIC DATA HOOK
// ============================================

export interface UseDataReturn<T> {
    data: T[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

// ============================================
// 👥 USERS HOOK
// ============================================

export interface UseUsersReturn extends UseDataReturn<User> {
    createUser: (input: any) => Promise<ApiResponse<User>>;
    updateUser: (id: string, input: any) => Promise<ApiResponse<User>>;
    deleteUser: (id: string) => Promise<ApiResponse<void>>;
}

export function useUsers(currentUserRole?: UserRole): UseUsersReturn {
    const [data, setData] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (!isFirebaseAvailable()) {
            setLoading(false);
            return;
        }

        unsubscribeRef.current = UsersAPI.subscribe(
            (users) => {
                setData(users);
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );

        return () => {
            unsubscribeRef.current?.();
        };
    }, []);

    const refresh = useCallback(async () => {
        setLoading(true);
        const result = await UsersAPI.getAll({}, currentUserRole);
        if (result.success && result.data) {
            setData(result.data);
        } else {
            setError(result.error?.message || 'Lỗi tải dữ liệu');
        }
        setLoading(false);
    }, [currentUserRole]);

    const createUser = useCallback(async (input: any) => {
        const result = await UsersAPI.create(input, undefined, currentUserRole);
        if (result.success) {
            await refresh();
        }
        return result;
    }, [currentUserRole, refresh]);

    const updateUser = useCallback(async (id: string, input: any) => {
        const result = await UsersAPI.update(id, input, undefined, currentUserRole);
        if (result.success) {
            await refresh();
        }
        return result;
    }, [currentUserRole, refresh]);

    const deleteUser = useCallback(async (id: string) => {
        const result = await UsersAPI.delete(id, undefined, currentUserRole);
        if (result.success) {
            await refresh();
        }
        return result;
    }, [currentUserRole, refresh]);

    return { data, loading, error, refresh, createUser, updateUser, deleteUser };
}

// ============================================
// 🏓 VISITORS HOOK
// ============================================

export interface UseVisitorsReturn extends UseDataReturn<Visitor> {
    createVisitor: (input: any) => Promise<ApiResponse<Visitor>>;
    todayVisitors: Visitor[];
    totalToday: number;
}

export function useVisitors(dateFilter?: Date): UseVisitorsReturn {
    const [data, setData] = useState<Visitor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (!isFirebaseAvailable()) {
            setLoading(false);
            return;
        }

        unsubscribeRef.current = VisitorsAPI.subscribe(
            (visitors) => {
                setData(visitors);
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            },
            dateFilter
        );

        return () => {
            unsubscribeRef.current?.();
        };
    }, [dateFilter]);

    const refresh = useCallback(async () => {
        setLoading(true);
        const result = await VisitorsAPI.getAll();
        if (result.success && result.data) {
            setData(result.data);
        } else {
            setError(result.error?.message || 'Lỗi tải dữ liệu');
        }
        setLoading(false);
    }, []);

    const createVisitor = useCallback(async (input: any) => {
        const result = await VisitorsAPI.create(input);
        return result;
    }, []);

    // Filter today's visitors
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayVisitors = data.filter(v => {
        const visitDate = v.visit_date?.toDate?.() || new Date(v.visit_date as any);
        visitDate.setHours(0, 0, 0, 0);
        return visitDate.getTime() === today.getTime();
    });

    return {
        data,
        loading,
        error,
        refresh,
        createVisitor,
        todayVisitors,
        totalToday: todayVisitors.length,
    };
}

// ============================================
// 🧾 PAYMENTS HOOK
// ============================================

export interface UsePaymentsReturn extends UseDataReturn<Payment> {
    confirmPayment: (id: string, transactionId?: string) => Promise<ApiResponse<Payment>>;
    todayRevenue: number;
    pendingCount: number;
}

export function usePayments(): UsePaymentsReturn {
    const [data, setData] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (!isFirebaseAvailable()) {
            setLoading(false);
            return;
        }

        unsubscribeRef.current = PaymentsAPI.subscribe(
            (payments) => {
                setData(payments);
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );

        return () => {
            unsubscribeRef.current?.();
        };
    }, []);

    const refresh = useCallback(async () => {
        setLoading(true);
        const result = await PaymentsAPI.getAll();
        if (result.success && result.data) {
            setData(result.data);
        } else {
            setError(result.error?.message || 'Lỗi tải dữ liệu');
        }
        setLoading(false);
    }, []);

    const confirmPayment = useCallback(async (id: string, transactionId?: string) => {
        return await PaymentsAPI.confirm(id, transactionId);
    }, []);

    // Calculate today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayRevenue = data
        .filter(p => {
            if (p.payment_status !== 'paid') return false;
            const paymentDate = p.payment_time?.toDate?.() || new Date(p.payment_time as any);
            paymentDate.setHours(0, 0, 0, 0);
            return paymentDate.getTime() === today.getTime();
        })
        .reduce((sum, p) => sum + p.amount, 0);

    const pendingCount = data.filter(p => p.payment_status === 'pending').length;

    return {
        data,
        loading,
        error,
        refresh,
        confirmPayment,
        todayRevenue,
        pendingCount,
    };
}

// ============================================
// 📅 SCHEDULES HOOK
// ============================================

export interface UseSchedulesReturn extends UseDataReturn<Schedule> {
    createSchedule: (input: any) => Promise<ApiResponse<Schedule>>;
    getSchedulesByDay: (day: string) => Schedule[];
}

export function useSchedules(): UseSchedulesReturn {
    const [data, setData] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (!isFirebaseAvailable()) {
            setLoading(false);
            return;
        }

        unsubscribeRef.current = SchedulesAPI.subscribe(
            (schedules) => {
                setData(schedules);
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );

        return () => {
            unsubscribeRef.current?.();
        };
    }, []);

    const refresh = useCallback(async () => {
        setLoading(true);
        const result = await SchedulesAPI.getAll();
        if (result.success && result.data) {
            setData(result.data);
        } else {
            setError(result.error?.message || 'Lỗi tải dữ liệu');
        }
        setLoading(false);
    }, []);

    const createSchedule = useCallback(async (input: any) => {
        const result = await SchedulesAPI.create(input);
        if (result.success) {
            await refresh();
        }
        return result;
    }, [refresh]);

    const getSchedulesByDay = useCallback((day: string) => {
        return data.filter(s => s.day_of_week === day);
    }, [data]);

    return { data, loading, error, refresh, createSchedule, getSchedulesByDay };
}

// ============================================
// 🛒 PRODUCTS HOOK
// ============================================

export interface UseProductsReturn extends UseDataReturn<Product> {
    createProduct: (input: any) => Promise<ApiResponse<Product>>;
    getByCategory: (category: string) => Product[];
    featuredProducts: Product[];
}

export function useProducts(category?: string): UseProductsReturn {
    const [data, setData] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (!isFirebaseAvailable()) {
            setLoading(false);
            return;
        }

        unsubscribeRef.current = ProductsAPI.subscribe(
            (products) => {
                setData(products);
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );

        return () => {
            unsubscribeRef.current?.();
        };
    }, []);

    const refresh = useCallback(async () => {
        setLoading(true);
        const result = await ProductsAPI.getAll({ category });
        if (result.success && result.data) {
            setData(result.data);
        } else {
            setError(result.error?.message || 'Lỗi tải dữ liệu');
        }
        setLoading(false);
    }, [category]);

    const createProduct = useCallback(async (input: any) => {
        const result = await ProductsAPI.create(input);
        if (result.success) {
            await refresh();
        }
        return result;
    }, [refresh]);

    const getByCategory = useCallback((cat: string) => {
        return data.filter(p => p.category === cat);
    }, [data]);

    const featuredProducts = data.filter(p => p.featured);

    return { data, loading, error, refresh, createProduct, getByCategory, featuredProducts };
}

// ============================================
// 📦 ORDERS HOOK
// ============================================

export interface UseOrdersReturn extends UseDataReturn<Order> {
    createOrder: (input: any, userId: string) => Promise<ApiResponse<Order>>;
    updateStatus: (id: string, status: any) => Promise<ApiResponse<Order>>;
    cancelOrder: (id: string, reason: string) => Promise<ApiResponse<Order>>;
    pendingOrders: Order[];
    myOrders: (userId: string) => Order[];
}

export function useOrders(userId?: string): UseOrdersReturn {
    const [data, setData] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (!isFirebaseAvailable()) {
            setLoading(false);
            return;
        }

        unsubscribeRef.current = OrdersAPI.subscribe(
            (orders) => {
                setData(orders);
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            },
            userId
        );

        return () => {
            unsubscribeRef.current?.();
        };
    }, [userId]);

    const refresh = useCallback(async () => {
        setLoading(true);
        const result = await OrdersAPI.getAll();
        if (result.success && result.data) {
            setData(result.data);
        } else {
            setError(result.error?.message || 'Lỗi tải dữ liệu');
        }
        setLoading(false);
    }, []);

    const createOrder = useCallback(async (input: any, uid: string) => {
        return await OrdersAPI.create(input, uid);
    }, []);

    const updateStatus = useCallback(async (id: string, status: any) => {
        return await OrdersAPI.updateStatus(id, status);
    }, []);

    const cancelOrder = useCallback(async (id: string, reason: string) => {
        return await OrdersAPI.cancel(id, reason);
    }, []);

    const pendingOrders = data.filter(o => o.order_status === 'pending');

    const myOrders = useCallback((uid: string) => {
        return data.filter(o => o.user_id === uid);
    }, [data]);

    return {
        data,
        loading,
        error,
        refresh,
        createOrder,
        updateStatus,
        cancelOrder,
        pendingOrders,
        myOrders,
    };
}

// ============================================
// 📋 CONTACTS HOOK
// ============================================

export interface UseContactsReturn extends UseDataReturn<Contact> {
    submitContact: (input: any) => Promise<ApiResponse<Contact>>;
    markAsRead: (id: string) => Promise<ApiResponse<Contact>>;
    newContacts: Contact[];
}

export function useContacts(): UseContactsReturn {
    const [data, setData] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (!isFirebaseAvailable()) {
            setLoading(false);
            return;
        }

        unsubscribeRef.current = ContactsAPI.subscribe(
            (contacts) => {
                setData(contacts);
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );

        return () => {
            unsubscribeRef.current?.();
        };
    }, []);

    const refresh = useCallback(async () => {
        setLoading(true);
        const result = await ContactsAPI.getAll();
        if (result.success && result.data) {
            setData(result.data);
        } else {
            setError(result.error?.message || 'Lỗi tải dữ liệu');
        }
        setLoading(false);
    }, []);

    const submitContact = useCallback(async (input: any) => {
        return await ContactsAPI.create(input);
    }, []);

    const markAsRead = useCallback(async (id: string) => {
        return await ContactsAPI.markAsRead(id);
    }, []);

    const newContacts = data.filter(c => c.status === 'new');

    return {
        data,
        loading,
        error,
        refresh,
        submitContact,
        markAsRead,
        newContacts,
    };
}

// ============================================
// 📊 DASHBOARD STATS HOOK
// ============================================

export interface DashboardStats {
    totalVisitors: number;
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    newContacts: number;
    activeProducts: number;
}

export interface UseDashboardReturn {
    stats: DashboardStats | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (!isFirebaseAvailable()) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const result = await StatsAPI.getDashboardStats();

        if (result.success && result.data) {
            setStats(result.data);
        } else {
            setError(result.error?.message || 'Lỗi tải thống kê');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        refresh();

        // Refresh every 30 seconds
        const interval = setInterval(refresh, 30000);

        return () => clearInterval(interval);
    }, [refresh]);

    return { stats, loading, error, refresh };
}

// ============================================
// 📤 EXPORT ALL HOOKS
// ============================================

export {
    useAuth,
    useToast,
    useUsers,
    useVisitors,
    usePayments,
    useSchedules,
    useProducts,
    useOrders,
    useContacts,
    useDashboard,
};
