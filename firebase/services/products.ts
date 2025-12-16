/**
 * ============================================
 * PRODUCTS SERVICE - Production Ready
 * ============================================
 */

import { orderBy, where, Unsubscribe, Timestamp } from 'firebase/firestore';
import {
    Product,
    ProductInput,
    COLLECTION_NAMES,
    validateProduct,
} from '../types';
import {
    createDocument,
    updateDocument,
    deleteDocument,
    getDocument,
    getDocuments,
    subscribeToCollection,
} from './core';

const COLLECTION = COLLECTION_NAMES.PRODUCTS;

// ============================================
// CRUD OPERATIONS
// ============================================

export const createProduct = async (
    data: ProductInput,
    createdBy: string
): Promise<{ success: boolean; id?: string; errors?: string[] }> => {
    const validation = validateProduct(data);
    if (!validation.valid) {
        return { success: false, errors: validation.errors };
    }

    try {
        const id = await createDocument<ProductInput>(
            COLLECTION,
            data,
            createdBy,
            'CREATE_PRODUCT'
        );

        return { success: true, id };
    } catch (error: any) {
        console.error('❌ Create product error:', error);
        return { success: false, errors: [error.message] };
    }
};

export const updateProduct = async (
    id: string,
    data: Partial<ProductInput>,
    updatedBy: string
): Promise<{ success: boolean; errors?: string[] }> => {
    try {
        if (data.price !== undefined && data.price < 0) {
            return { success: false, errors: ['Giá phải >= 0'] };
        }
        if (data.stock !== undefined && (data.stock < 0 || !Number.isInteger(data.stock))) {
            return { success: false, errors: ['Stock phải là số nguyên >= 0'] };
        }

        await updateDocument<Product>(
            COLLECTION,
            id,
            data,
            updatedBy,
            'UPDATE_PRODUCT'
        );

        return { success: true };
    } catch (error: any) {
        console.error('❌ Update product error:', error);
        return { success: false, errors: [error.message] };
    }
};

export const deleteProduct = async (
    id: string,
    deletedBy: string,
    hardDelete: boolean = false
): Promise<{ success: boolean; errors?: string[] }> => {
    try {
        await deleteDocument(
            COLLECTION,
            id,
            deletedBy,
            'DELETE_PRODUCT',
            hardDelete
        );

        return { success: true };
    } catch (error: any) {
        console.error('❌ Delete product error:', error);
        return { success: false, errors: [error.message] };
    }
};

// ============================================
// READ OPERATIONS
// ============================================

export const getProductById = async (id: string): Promise<Product | null> => {
    return getDocument<Product>(COLLECTION, id);
};

export const getAllProducts = async (): Promise<Product[]> => {
    return getDocuments<Product>(COLLECTION, orderBy('createdAt', 'desc'));
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
    return getDocuments<Product>(
        COLLECTION,
        where('category', '==', category),
        orderBy('createdAt', 'desc')
    );
};

export const getInStockProducts = async (): Promise<Product[]> => {
    return getDocuments<Product>(
        COLLECTION,
        where('stock', '>', 0),
        orderBy('stock', 'desc')
    );
};

// ============================================
// REALTIME SYNC
// ============================================

export const subscribeToProducts = (
    callback: (products: Product[]) => void,
    onError: (error: Error) => void
): Unsubscribe => {
    return subscribeToCollection<Product>(
        COLLECTION,
        callback,
        onError,
        orderBy('createdAt', 'desc')
    );
};

// ============================================
// STATISTICS
// ============================================

export const getProductStats = async (): Promise<{
    total: number;
    inStock: number;
    outOfStock: number;
    totalValue: number;
    categories: string[];
}> => {
    const products = await getAllProducts();

    const categories = [...new Set(products.map(p => p.category))];

    return {
        total: products.length,
        inStock: products.filter(p => p.stock > 0).length,
        outOfStock: products.filter(p => p.stock === 0).length,
        totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
        categories,
    };
};
