/**
 * ============================================================
 * 📊 STATISTICS SERVICE
 * ============================================================
 * 
 * Firestore queries for real statistics.
 * ❌ NO FAKE NUMBERS
 * ❌ NO ESTIMATED VALUES
 * ✅ ONLY REAL DATA FROM FIRESTORE
 * 
 * ============================================================
 */

import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    onSnapshot,
    Timestamp,
    DocumentData,
    QueryConstraint,
} from 'firebase/firestore';
import { db } from './config';
import { COLLECTIONS } from './schema';

// ============================================================
// 🔧 HELPER FUNCTIONS
// ============================================================

function getStartOfDay(date: Date): Date {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
}

function getEndOfDay(date: Date): Date {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
}

function getStartOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function getEndOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function getLast7Days(): Date[] {
    const days: Date[] = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(getStartOfDay(date));
    }
    return days;
}

function getLast30Days(): Date[] {
    const days: Date[] = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(getStartOfDay(date));
    }
    return days;
}

// ============================================================
// 📊 VISIT STATISTICS
// ============================================================

export interface VisitStats {
    totalToday: number;
    totalThisWeek: number;
    totalThisMonth: number;
    byPlayType: { hourly: number; daily: number; monthly: number };
    byDay: { date: string; count: number }[];
}

export async function getVisitStats(): Promise<VisitStats> {
    if (!db) throw new Error('Firebase not available');

    const today = new Date();
    const startOfToday = Timestamp.fromDate(getStartOfDay(today));
    const startOfWeek = Timestamp.fromDate(new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000));
    const startOfMonth = Timestamp.fromDate(getStartOfMonth(today));

    // Get all visits for this month
    const visitsRef = collection(db, COLLECTIONS.VISITS);
    const monthQuery = query(
        visitsRef,
        where('date', '>=', startOfMonth),
        orderBy('date', 'desc')
    );

    const snapshot = await getDocs(monthQuery);
    const visits = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    // Calculate statistics from real data
    let totalToday = 0;
    let totalThisWeek = 0;
    let totalThisMonth = visits.length;
    const byPlayType = { hourly: 0, daily: 0, monthly: 0 };
    const dayCountMap: Record<string, number> = {};

    visits.forEach(visit => {
        const visitDate = (visit.date as Timestamp).toDate();
        const dateString = visitDate.toISOString().split('T')[0];

        // Count by play type
        const playType = visit.playType as string;
        if (playType in byPlayType) {
            byPlayType[playType as keyof typeof byPlayType]++;
        }

        // Count by day
        dayCountMap[dateString] = (dayCountMap[dateString] || 0) + 1;

        // Check if today
        if (visitDate >= getStartOfDay(today)) {
            totalToday++;
        }

        // Check if this week
        if (visitDate >= startOfWeek.toDate()) {
            totalThisWeek++;
        }
    });

    // Convert to array sorted by date
    const byDay = getLast7Days().map(date => ({
        date: date.toISOString().split('T')[0],
        count: dayCountMap[date.toISOString().split('T')[0]] || 0,
    }));

    return {
        totalToday,
        totalThisWeek,
        totalThisMonth,
        byPlayType,
        byDay,
    };
}

// Subscribe to real-time visit stats
export function subscribeToVisitStats(
    callback: (stats: VisitStats) => void,
    onError?: (error: Error) => void
): () => void {
    if (!db) {
        onError?.(new Error('Firebase not available'));
        return () => { };
    }

    const startOfMonth = Timestamp.fromDate(getStartOfMonth(new Date()));
    const visitsRef = collection(db, COLLECTIONS.VISITS);
    const monthQuery = query(
        visitsRef,
        where('date', '>=', startOfMonth),
        orderBy('date', 'desc')
    );

    return onSnapshot(
        monthQuery,
        async () => {
            try {
                const stats = await getVisitStats();
                callback(stats);
            } catch (error) {
                onError?.(error as Error);
            }
        },
        onError
    );
}

// ============================================================
// 💰 REVENUE STATISTICS
// ============================================================

export interface RevenueStats {
    todayRevenue: number;
    weekRevenue: number;
    monthRevenue: number;
    byPaymentMethod: Record<string, number>;
    byDay: { date: string; amount: number }[];
    byMonth: { month: string; amount: number }[];
}

export async function getRevenueStats(): Promise<RevenueStats> {
    if (!db) throw new Error('Firebase not available');

    const today = new Date();
    const startOfToday = Timestamp.fromDate(getStartOfDay(today));
    const startOfWeek = Timestamp.fromDate(new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000));
    const startOfMonth = Timestamp.fromDate(getStartOfMonth(today));

    // Get all payments for this month
    const paymentsRef = collection(db, COLLECTIONS.PAYMENTS);
    const monthQuery = query(
        paymentsRef,
        where('status', '==', 'completed'),
        where('createdAt', '>=', startOfMonth),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(monthQuery);
    const payments = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    // Calculate from real data
    let todayRevenue = 0;
    let weekRevenue = 0;
    let monthRevenue = 0;
    const byPaymentMethod: Record<string, number> = {};
    const dayAmountMap: Record<string, number> = {};

    payments.forEach(payment => {
        const amount = (payment.amount as number) || 0;
        const paymentDate = (payment.createdAt as Timestamp)?.toDate() || new Date();
        const dateString = paymentDate.toISOString().split('T')[0];
        const method = (payment.paymentMethod as string) || 'other';

        // Total month revenue
        monthRevenue += amount;

        // By payment method
        byPaymentMethod[method] = (byPaymentMethod[method] || 0) + amount;

        // By day
        dayAmountMap[dateString] = (dayAmountMap[dateString] || 0) + amount;

        // Check if today
        if (paymentDate >= getStartOfDay(today)) {
            todayRevenue += amount;
        }

        // Check if this week
        if (paymentDate >= startOfWeek.toDate()) {
            weekRevenue += amount;
        }
    });

    // Convert to array sorted by date
    const byDay = getLast7Days().map(date => ({
        date: date.toISOString().split('T')[0],
        amount: dayAmountMap[date.toISOString().split('T')[0]] || 0,
    }));

    // Calculate monthly (this month only for now)
    const byMonth = [{
        month: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
        amount: monthRevenue,
    }];

    return {
        todayRevenue,
        weekRevenue,
        monthRevenue,
        byPaymentMethod,
        byDay,
        byMonth,
    };
}

// Subscribe to real-time revenue stats
export function subscribeToRevenueStats(
    callback: (stats: RevenueStats) => void,
    onError?: (error: Error) => void
): () => void {
    if (!db) {
        onError?.(new Error('Firebase not available'));
        return () => { };
    }

    const startOfMonth = Timestamp.fromDate(getStartOfMonth(new Date()));
    const paymentsRef = collection(db, COLLECTIONS.PAYMENTS);
    const monthQuery = query(
        paymentsRef,
        where('createdAt', '>=', startOfMonth),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(
        monthQuery,
        async () => {
            try {
                const stats = await getRevenueStats();
                callback(stats);
            } catch (error) {
                onError?.(error as Error);
            }
        },
        onError
    );
}

// ============================================================
// 🛒 PRODUCT STATISTICS
// ============================================================

export interface ProductStats {
    totalProducts: number;
    totalStock: number;
    lowStockProducts: { id: string; name: string; stock: number }[];
    byCategory: Record<string, number>;
    featuredCount: number;
}

export async function getProductStats(): Promise<ProductStats> {
    if (!db) throw new Error('Firebase not available');

    // Get all active products
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    const activeQuery = query(
        productsRef,
        where('status', '==', 'active')
    );

    const snapshot = await getDocs(activeQuery);
    const products = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    // Calculate from real data
    let totalStock = 0;
    let featuredCount = 0;
    const byCategory: Record<string, number> = {};
    const lowStockProducts: { id: string; name: string; stock: number }[] = [];

    products.forEach(product => {
        const stock = (product.stock as number) || 0;
        const category = (product.category as string) || 'other';

        totalStock += stock;

        // By category
        byCategory[category] = (byCategory[category] || 0) + 1;

        // Featured products
        if (product.featured) {
            featuredCount++;
        }

        // Low stock alert (less than 5)
        if (stock < 5 && stock >= 0) {
            lowStockProducts.push({
                id: product.id,
                name: product.name as string,
                stock,
            });
        }
    });

    // Sort low stock by stock ascending
    lowStockProducts.sort((a, b) => a.stock - b.stock);

    return {
        totalProducts: products.length,
        totalStock,
        lowStockProducts,
        byCategory,
        featuredCount,
    };
}

// Subscribe to real-time product stats
export function subscribeToProductStats(
    callback: (stats: ProductStats) => void,
    onError?: (error: Error) => void
): () => void {
    if (!db) {
        onError?.(new Error('Firebase not available'));
        return () => { };
    }

    const productsRef = collection(db, COLLECTIONS.PRODUCTS);

    return onSnapshot(
        productsRef,
        async () => {
            try {
                const stats = await getProductStats();
                callback(stats);
            } catch (error) {
                onError?.(error as Error);
            }
        },
        onError
    );
}

// ============================================================
// 📧 CONTACT STATISTICS
// ============================================================

export interface ContactStats {
    totalContacts: number;
    newContacts: number;
    readContacts: number;
    repliedContacts: number;
    byDay: { date: string; count: number }[];
    recentContacts: { id: string; name: string; subject: string; status: string; date: Date }[];
}

export async function getContactStats(): Promise<ContactStats> {
    if (!db) throw new Error('Firebase not available');

    // Get all contacts
    const contactsRef = collection(db, COLLECTIONS.CONTACTS);
    const contactsQuery = query(
        contactsRef,
        orderBy('createdAt', 'desc'),
        limit(100)
    );

    const snapshot = await getDocs(contactsQuery);
    const contacts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    // Calculate from real data
    let newContacts = 0;
    let readContacts = 0;
    let repliedContacts = 0;
    const dayCountMap: Record<string, number> = {};
    const recentContacts: ContactStats['recentContacts'] = [];

    contacts.forEach((contact, index) => {
        const status = contact.status as string;
        const createdAt = (contact.createdAt as Timestamp)?.toDate() || new Date();
        const dateString = createdAt.toISOString().split('T')[0];

        // Count by status
        if (status === 'new') newContacts++;
        else if (status === 'read') readContacts++;
        else if (status === 'replied' || status === 'archived') repliedContacts++;

        // Count by day
        dayCountMap[dateString] = (dayCountMap[dateString] || 0) + 1;

        // Get 5 most recent
        if (index < 5) {
            recentContacts.push({
                id: contact.id,
                name: contact.name as string,
                subject: (contact.subject as string) || 'Không có tiêu đề',
                status,
                date: createdAt,
            });
        }
    });

    // Convert to array sorted by date
    const byDay = getLast7Days().map(date => ({
        date: date.toISOString().split('T')[0],
        count: dayCountMap[date.toISOString().split('T')[0]] || 0,
    }));

    return {
        totalContacts: contacts.length,
        newContacts,
        readContacts,
        repliedContacts,
        byDay,
        recentContacts,
    };
}

// Subscribe to real-time contact stats
export function subscribeToContactStats(
    callback: (stats: ContactStats) => void,
    onError?: (error: Error) => void
): () => void {
    if (!db) {
        onError?.(new Error('Firebase not available'));
        return () => { };
    }

    const contactsRef = collection(db, COLLECTIONS.CONTACTS);

    return onSnapshot(
        contactsRef,
        async () => {
            try {
                const stats = await getContactStats();
                callback(stats);
            } catch (error) {
                onError?.(error as Error);
            }
        },
        onError
    );
}

// ============================================================
// 📊 COMBINED DASHBOARD STATS
// ============================================================

export interface DashboardStats {
    visits: VisitStats;
    revenue: RevenueStats;
    products: ProductStats;
    contacts: ContactStats;
    lastUpdated: Date;
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const [visits, revenue, products, contacts] = await Promise.all([
        getVisitStats(),
        getRevenueStats(),
        getProductStats(),
        getContactStats(),
    ]);

    return {
        visits,
        revenue,
        products,
        contacts,
        lastUpdated: new Date(),
    };
}

export default {
    getVisitStats,
    getRevenueStats,
    getProductStats,
    getContactStats,
    getDashboardStats,
    subscribeToVisitStats,
    subscribeToRevenueStats,
    subscribeToProductStats,
    subscribeToContactStats,
};
