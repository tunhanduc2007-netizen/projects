// Shop Service - Quản lý cửa hàng
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from '../config';

export interface Product {
    id?: string;
    name: string;
    description: string;
    price: number;
    salePrice?: number;
    category: 'racket' | 'rubber' | 'accessory' | 'clothing' | 'other';
    brand: string;
    imageUrl: string;
    images?: string[];
    stock: number;
    status: 'active' | 'inactive' | 'out_of_stock';
    featured: boolean;
    specifications?: Record<string, string>;
    createdAt: Date | Timestamp;
    updatedAt: Date | Timestamp;
}

export interface Order {
    id?: string;
    customerId?: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    items: OrderItem[];
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentMethod: 'cod' | 'bank_transfer' | 'momo' | 'zalopay';
    paymentStatus: 'pending' | 'paid' | 'refunded';
    notes?: string;
    createdAt: Date | Timestamp;
    updatedAt: Date | Timestamp;
}

export interface OrderItem {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    imageUrl?: string;
}

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';

// ========== PRODUCTS ==========

// Lấy tất cả sản phẩm
export const getAllProducts = async (): Promise<Product[]> => {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Product));
};

// Lấy sản phẩm theo ID
export const getProductById = async (id: string): Promise<Product | null> => {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Product;
    }
    return null;
};

// Lấy sản phẩm theo category
export const getProductsByCategory = async (category: Product['category']): Promise<Product[]> => {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, where('category', '==', category), where('status', '==', 'active'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Product));
};

// Lấy sản phẩm nổi bật
export const getFeaturedProducts = async (): Promise<Product[]> => {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, where('featured', '==', true), where('status', '==', 'active'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Product));
};

// Thêm sản phẩm mới
export const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const now = Timestamp.now();
    const docRef = await addDoc(productsRef, {
        ...product,
        createdAt: now,
        updatedAt: now
    });
    return docRef.id;
};

// Cập nhật sản phẩm
export const updateProduct = async (id: string, product: Partial<Product>): Promise<void> => {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(docRef, {
        ...product,
        updatedAt: Timestamp.now()
    });
};

// Xóa sản phẩm
export const deleteProduct = async (id: string): Promise<void> => {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(docRef);
};

// ========== ORDERS ==========

// Lấy tất cả đơn hàng
export const getAllOrders = async (): Promise<Order[]> => {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Order));
};

// Lấy đơn hàng theo ID
export const getOrderById = async (id: string): Promise<Order | null> => {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Order;
    }
    return null;
};

// Tạo đơn hàng mới
export const createOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const now = Timestamp.now();
    const docRef = await addDoc(ordersRef, {
        ...order,
        createdAt: now,
        updatedAt: now
    });

    // Cập nhật stock cho từng sản phẩm
    for (const item of order.items) {
        const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
            const productData = productSnap.data() as Product;
            const newStock = Math.max(0, productData.stock - item.quantity);
            await updateDoc(productRef, {
                stock: newStock,
                status: newStock === 0 ? 'out_of_stock' : productData.status
            });
        }
    }

    return docRef.id;
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (id: string, status: Order['status']): Promise<void> => {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    await updateDoc(docRef, {
        status,
        updatedAt: Timestamp.now()
    });
};

// Cập nhật trạng thái thanh toán
export const updatePaymentStatus = async (id: string, paymentStatus: Order['paymentStatus']): Promise<void> => {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    await updateDoc(docRef, {
        paymentStatus,
        updatedAt: Timestamp.now()
    });
};

// Lấy đơn hàng theo trạng thái
export const getOrdersByStatus = async (status: Order['status']): Promise<Order[]> => {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(ordersRef, where('status', '==', status), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Order));
};

// Thống kê cửa hàng
export const getShopStats = async () => {
    const [products, orders] = await Promise.all([
        getAllProducts(),
        getAllOrders()
    ]);

    const totalRevenue = orders
        .filter(o => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + o.total, 0);

    return {
        totalProducts: products.length,
        activeProducts: products.filter(p => p.status === 'active').length,
        outOfStock: products.filter(p => p.status === 'out_of_stock').length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        completedOrders: orders.filter(o => o.status === 'delivered').length,
        totalRevenue
    };
};
