/**
 * ============================================
 * PAYMENTS SERVICE - Production Ready
 * ============================================
 */

import {
    orderBy,
    where,
    Unsubscribe,
    Timestamp,
    runTransaction,
    doc,
    collection,
} from 'firebase/firestore';
import { db } from '../config';
import {
    Payment,
    PaymentInput,
    Order,
    COLLECTION_NAMES,
    validatePayment,
} from '../types';
import {
    getDocument,
    getDocuments,
    subscribeToCollection,
    writeLog,
    executeTransaction,
} from './core';

const PAYMENTS = COLLECTION_NAMES.PAYMENTS;
const ORDERS = COLLECTION_NAMES.ORDERS;

// ============================================
// PAYMENT OPERATIONS
// ============================================

/**
 * Tạo thanh toán và cập nhật order status
 * BẮT BUỘC dùng Transaction
 */
export const createPayment = async (
    data: PaymentInput,
    createdBy: string
): Promise<{ success: boolean; paymentId?: string; errors?: string[] }> => {
    // Validate
    const validation = validatePayment(data);
    if (!validation.valid) {
        return { success: false, errors: validation.errors };
    }

    try {
        const paymentId = await executeTransaction(async (transaction) => {
            // 1. Kiểm tra order tồn tại và chưa thanh toán
            const orderRef = doc(db, ORDERS, data.orderId);
            const orderSnap = await transaction.get(orderRef);

            if (!orderSnap.exists()) {
                throw new Error('Đơn hàng không tồn tại');
            }

            const order = orderSnap.data() as Order;

            if (order.status === 'paid') {
                throw new Error('Đơn hàng đã được thanh toán');
            }

            if (order.status === 'canceled') {
                throw new Error('Không thể thanh toán đơn hàng đã hủy');
            }

            // 2. Tạo payment record
            const paymentRef = doc(collection(db, PAYMENTS));
            const paymentData: Omit<Payment, 'id'> = {
                orderId: data.orderId,
                amount: data.amount,
                method: data.method,
                status: 'success',
                paidAt: Timestamp.now(),
            };
            transaction.set(paymentRef, paymentData);

            // 3. Cập nhật order status
            transaction.update(orderRef, {
                status: 'paid',
                updatedAt: Timestamp.now(),
            });

            return paymentRef.id;
        });

        // Log
        await writeLog('CREATE_PAYMENT', createdBy, {
            paymentId,
            orderId: data.orderId,
            amount: data.amount,
            method: data.method,
        });

        return { success: true, paymentId };

    } catch (error: any) {
        console.error('❌ Create payment error:', error);
        return { success: false, errors: [error.message] };
    }
};

/**
 * Đánh dấu payment failed
 */
export const markPaymentFailed = async (
    paymentId: string,
    updatedBy: string
): Promise<{ success: boolean; errors?: string[] }> => {
    try {
        await executeTransaction(async (transaction) => {
            const paymentRef = doc(db, PAYMENTS, paymentId);
            const paymentSnap = await transaction.get(paymentRef);

            if (!paymentSnap.exists()) {
                throw new Error('Payment không tồn tại');
            }

            const payment = paymentSnap.data() as Payment;

            // Revert order status về pending
            const orderRef = doc(db, ORDERS, payment.orderId);
            transaction.update(orderRef, {
                status: 'pending',
                updatedAt: Timestamp.now(),
            });

            // Update payment status
            transaction.update(paymentRef, {
                status: 'failed',
            });
        });

        await writeLog('UPDATE_PAYMENT', updatedBy, { paymentId, status: 'failed' });

        return { success: true };

    } catch (error: any) {
        console.error('❌ Mark payment failed error:', error);
        return { success: false, errors: [error.message] };
    }
};

// ============================================
// READ OPERATIONS
// ============================================

export const getPaymentById = async (id: string): Promise<Payment | null> => {
    return getDocument<Payment>(PAYMENTS, id);
};

export const getAllPayments = async (): Promise<Payment[]> => {
    return getDocuments<Payment>(PAYMENTS, orderBy('paidAt', 'desc'));
};

export const getPaymentsByOrder = async (orderId: string): Promise<Payment[]> => {
    return getDocuments<Payment>(
        PAYMENTS,
        where('orderId', '==', orderId),
        orderBy('paidAt', 'desc')
    );
};

export const getPaymentsByStatus = async (status: 'success' | 'failed'): Promise<Payment[]> => {
    return getDocuments<Payment>(
        PAYMENTS,
        where('status', '==', status),
        orderBy('paidAt', 'desc')
    );
};

export const getPaymentsByMethod = async (method: 'cash' | 'transfer'): Promise<Payment[]> => {
    return getDocuments<Payment>(
        PAYMENTS,
        where('method', '==', method),
        orderBy('paidAt', 'desc')
    );
};

// ============================================
// REALTIME SYNC
// ============================================

export const subscribeToPayments = (
    callback: (payments: Payment[]) => void,
    onError: (error: Error) => void
): Unsubscribe => {
    return subscribeToCollection<Payment>(
        PAYMENTS,
        callback,
        onError,
        orderBy('paidAt', 'desc')
    );
};

// ============================================
// STATISTICS
// ============================================

export const getPaymentStats = async (): Promise<{
    total: number;
    success: number;
    failed: number;
    totalAmount: number;
    byMethod: { cash: number; transfer: number };
}> => {
    const payments = await getAllPayments();
    const successPayments = payments.filter(p => p.status === 'success');

    return {
        total: payments.length,
        success: successPayments.length,
        failed: payments.filter(p => p.status === 'failed').length,
        totalAmount: successPayments.reduce((sum, p) => sum + p.amount, 0),
        byMethod: {
            cash: successPayments.filter(p => p.method === 'cash').reduce((sum, p) => sum + p.amount, 0),
            transfer: successPayments.filter(p => p.method === 'transfer').reduce((sum, p) => sum + p.amount, 0),
        },
    };
};
