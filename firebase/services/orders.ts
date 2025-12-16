/**
 * ============================================
 * ORDERS SERVICE - Production Ready
 * BẮT BUỘC SỬ DỤNG TRANSACTION
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
    getDoc,
} from 'firebase/firestore';
import { db } from '../config';
import {
    Order,
    OrderInput,
    OrderItem,
    Payment,
    PaymentInput,
    Product,
    COLLECTION_NAMES,
    validateOrder,
    validatePayment,
} from '../types';
import {
    getDocument,
    getDocuments,
    subscribeToCollection,
    writeLog,
    executeTransaction,
} from './core';

const ORDERS = COLLECTION_NAMES.ORDERS;
const PRODUCTS = COLLECTION_NAMES.PRODUCTS;
const PAYMENTS = COLLECTION_NAMES.PAYMENTS;

// ============================================
// ORDER CREATION WITH TRANSACTION
// ============================================

/**
 * Tạo đơn hàng với Transaction
 * 
 * Flow:
 * 1. Validate order input
 * 2. Check stock availability
 * 3. BEGIN TRANSACTION
 *    - Trừ stock sản phẩm
 *    - Tạo order
 *    - (Optional) Tạo payment
 * 4. COMMIT or ROLLBACK
 * 5. Log action
 */
export const createOrder = async (
    data: OrderInput,
    createdBy: string
): Promise<{ success: boolean; orderId?: string; errors?: string[] }> => {
    // 1. Validate frontend
    const validation = validateOrder(data);
    if (!validation.valid) {
        return { success: false, errors: validation.errors };
    }

    try {
        // 2. Transaction để đảm bảo consistency
        const orderId = await executeTransaction(async (transaction) => {
            // 2a. Kiểm tra và lock stock cho mỗi sản phẩm
            const productUpdates: Array<{
                ref: any;
                newStock: number;
                product: Product;
            }> = [];

            for (const item of data.items) {
                const productRef = doc(db, PRODUCTS, item.productId);
                const productSnap = await transaction.get(productRef);

                if (!productSnap.exists()) {
                    throw new Error(`Sản phẩm ${item.productId} không tồn tại`);
                }

                const product = productSnap.data() as Product;

                if (product.stock < item.quantity) {
                    throw new Error(
                        `Sản phẩm "${product.name}" chỉ còn ${product.stock} trong kho, không đủ ${item.quantity}`
                    );
                }

                productUpdates.push({
                    ref: productRef,
                    newStock: product.stock - item.quantity,
                    product: { ...product, id: productSnap.id },
                });
            }

            // 2b. Trừ stock từng sản phẩm
            for (const update of productUpdates) {
                transaction.update(update.ref, {
                    stock: update.newStock,
                    updatedAt: Timestamp.now(),
                });
            }

            // 2c. Tạo order
            const orderRef = doc(collection(db, ORDERS));
            const orderData: Omit<Order, 'id'> = {
                userId: data.userId,
                items: data.items,
                totalPrice: data.totalPrice,
                status: 'pending',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            };

            transaction.set(orderRef, orderData);

            return orderRef.id;
        });

        // 3. Log action (sau transaction thành công)
        await writeLog('CREATE_ORDER', createdBy, {
            orderId,
            items: data.items,
            totalPrice: data.totalPrice,
        });

        return { success: true, orderId };

    } catch (error: any) {
        console.error('❌ Create order error:', error);
        return { success: false, errors: [error.message] };
    }
};

/**
 * Tạo đơn hàng VÀ thanh toán cùng lúc (Transaction)
 */
export const createOrderWithPayment = async (
    orderData: OrderInput,
    paymentMethod: 'cash' | 'transfer',
    createdBy: string
): Promise<{
    success: boolean;
    orderId?: string;
    paymentId?: string;
    errors?: string[]
}> => {
    // Validate
    const orderValidation = validateOrder(orderData);
    if (!orderValidation.valid) {
        return { success: false, errors: orderValidation.errors };
    }

    try {
        const result = await executeTransaction(async (transaction) => {
            // 1. Check stock và trừ stock
            const productUpdates: Array<{ ref: any; newStock: number }> = [];

            for (const item of orderData.items) {
                const productRef = doc(db, PRODUCTS, item.productId);
                const productSnap = await transaction.get(productRef);

                if (!productSnap.exists()) {
                    throw new Error(`Sản phẩm ${item.productId} không tồn tại`);
                }

                const product = productSnap.data() as Product;

                if (product.stock < item.quantity) {
                    throw new Error(`Không đủ hàng: ${product.name}`);
                }

                productUpdates.push({
                    ref: productRef,
                    newStock: product.stock - item.quantity,
                });
            }

            // Trừ stock
            for (const update of productUpdates) {
                transaction.update(update.ref, {
                    stock: update.newStock,
                    updatedAt: Timestamp.now(),
                });
            }

            // 2. Tạo order với status = 'paid'
            const orderRef = doc(collection(db, ORDERS));
            const order: Omit<Order, 'id'> = {
                userId: orderData.userId,
                items: orderData.items,
                totalPrice: orderData.totalPrice,
                status: 'paid', // Đã thanh toán
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            };
            transaction.set(orderRef, order);

            // 3. Tạo payment
            const paymentRef = doc(collection(db, PAYMENTS));
            const payment: Omit<Payment, 'id'> = {
                orderId: orderRef.id,
                amount: orderData.totalPrice,
                method: paymentMethod,
                status: 'success',
                paidAt: Timestamp.now(),
            };
            transaction.set(paymentRef, payment);

            return { orderId: orderRef.id, paymentId: paymentRef.id };
        });

        // Log
        await writeLog('CREATE_ORDER', createdBy, {
            orderId: result.orderId,
            paymentId: result.paymentId,
            totalPrice: orderData.totalPrice,
            paymentMethod,
        });

        return {
            success: true,
            orderId: result.orderId,
            paymentId: result.paymentId
        };

    } catch (error: any) {
        console.error('❌ Create order with payment error:', error);
        return { success: false, errors: [error.message] };
    }
};

// ============================================
// UPDATE ORDER STATUS
// ============================================

/**
 * Cập nhật trạng thái đơn hàng
 */
export const updateOrderStatus = async (
    orderId: string,
    status: 'pending' | 'paid' | 'canceled',
    updatedBy: string
): Promise<{ success: boolean; errors?: string[] }> => {
    try {
        // Nếu cancel, hoàn lại stock
        if (status === 'canceled') {
            await executeTransaction(async (transaction) => {
                const orderRef = doc(db, ORDERS, orderId);
                const orderSnap = await transaction.get(orderRef);

                if (!orderSnap.exists()) {
                    throw new Error('Đơn hàng không tồn tại');
                }

                const order = orderSnap.data() as Order;

                if (order.status === 'canceled') {
                    throw new Error('Đơn hàng đã bị hủy trước đó');
                }

                // Hoàn lại stock
                for (const item of order.items) {
                    const productRef = doc(db, PRODUCTS, item.productId);
                    const productSnap = await transaction.get(productRef);

                    if (productSnap.exists()) {
                        const product = productSnap.data() as Product;
                        transaction.update(productRef, {
                            stock: product.stock + item.quantity,
                            updatedAt: Timestamp.now(),
                        });
                    }
                }

                // Cập nhật order status
                transaction.update(orderRef, {
                    status: 'canceled',
                    updatedAt: Timestamp.now(),
                });
            });
        } else {
            // Cập nhật bình thường
            const orderRef = doc(db, ORDERS, orderId);
            await runTransaction(db, async (transaction) => {
                transaction.update(orderRef, {
                    status,
                    updatedAt: Timestamp.now(),
                });
            });
        }

        await writeLog('UPDATE_ORDER', updatedBy, { orderId, status });

        return { success: true };

    } catch (error: any) {
        console.error('❌ Update order status error:', error);
        return { success: false, errors: [error.message] };
    }
};

// ============================================
// READ OPERATIONS
// ============================================

export const getOrderById = async (id: string): Promise<Order | null> => {
    return getDocument<Order>(ORDERS, id);
};

export const getAllOrders = async (): Promise<Order[]> => {
    return getDocuments<Order>(ORDERS, orderBy('createdAt', 'desc'));
};

export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
    return getDocuments<Order>(
        ORDERS,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
};

export const getOrdersByStatus = async (status: 'pending' | 'paid' | 'canceled'): Promise<Order[]> => {
    return getDocuments<Order>(
        ORDERS,
        where('status', '==', status),
        orderBy('createdAt', 'desc')
    );
};

// ============================================
// REALTIME SYNC
// ============================================

export const subscribeToOrders = (
    callback: (orders: Order[]) => void,
    onError: (error: Error) => void
): Unsubscribe => {
    return subscribeToCollection<Order>(
        ORDERS,
        callback,
        onError,
        orderBy('createdAt', 'desc')
    );
};

export const subscribeToUserOrders = (
    userId: string,
    callback: (orders: Order[]) => void,
    onError: (error: Error) => void
): Unsubscribe => {
    return subscribeToCollection<Order>(
        ORDERS,
        callback,
        onError,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
};

// ============================================
// STATISTICS
// ============================================

export const getOrderStats = async (): Promise<{
    total: number;
    pending: number;
    paid: number;
    canceled: number;
    totalRevenue: number;
}> => {
    const orders = await getAllOrders();

    return {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        paid: orders.filter(o => o.status === 'paid').length,
        canceled: orders.filter(o => o.status === 'canceled').length,
        totalRevenue: orders
            .filter(o => o.status === 'paid')
            .reduce((sum, o) => sum + o.totalPrice, 0),
    };
};
