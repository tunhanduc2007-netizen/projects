/**
 * ============================================
 * FIRESTORE CORE SERVICE
 * Production-ready with transactions, logging, and realtime sync
 * ============================================
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
    onSnapshot,
    runTransaction,
    writeBatch,
    Timestamp,
    Unsubscribe,
    DocumentReference,
    QueryConstraint,
} from 'firebase/firestore';
import { db, isFirebaseAvailable } from '../config';
import {
    COLLECTION_NAMES,
    Log,
    LogAction,
} from '../types';

// ============================================
// FIREBASE AVAILABILITY CHECK
// ============================================

const checkFirebase = () => {
    if (!isFirebaseAvailable() || !db) {
        throw new Error('Firebase không khả dụng. Vui lòng chạy Firebase Emulator trên localhost.');
    }
};

// ============================================
// LOGGING SERVICE - BẮT BUỘC MỖI THAO TÁC
// ============================================

/**
 * Ghi log mọi thao tác vào Firestore
 * KHÔNG BAO GIỜ bỏ qua logging
 */
export const writeLog = async (
    action: LogAction,
    by: string,
    data: Record<string, any>
): Promise<string> => {
    try {
        const logData: Omit<Log, 'id'> = {
            action,
            by,
            data,
            createdAt: Timestamp.now(),
        };

        const docRef = await addDoc(
            collection(db, COLLECTION_NAMES.LOGS),
            logData
        );

        console.log(`📝 Log written: ${action} by ${by}`);
        return docRef.id;
    } catch (error) {
        console.error('❌ Failed to write log:', error);
        throw error;
    }
};

// ============================================
// GENERIC CRUD WITH LOGGING
// ============================================

/**
 * Generic CREATE with validation and logging
 */
export const createDocument = async <T extends Record<string, any>>(
    collectionName: string,
    data: T,
    userId: string,
    action: LogAction
): Promise<string> => {
    const sanitizedData = sanitizeData(data);

    const docRef = await addDoc(
        collection(db, collectionName),
        {
            ...sanitizedData,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        }
    );

    // BẮT BUỘC: Ghi log
    await writeLog(action, userId, {
        documentId: docRef.id,
        collectionName,
        data: sanitizedData
    });

    return docRef.id;
};

/**
 * Generic UPDATE with validation and logging
 */
export const updateDocument = async <T extends Record<string, any>>(
    collectionName: string,
    documentId: string,
    data: Partial<T>,
    userId: string,
    action: LogAction
): Promise<void> => {
    const docRef = doc(db, collectionName, documentId);

    // Kiểm tra document tồn tại
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        throw new Error(`Document ${documentId} không tồn tại trong ${collectionName}`);
    }

    const sanitizedData = sanitizeData(data);

    await updateDoc(docRef, {
        ...sanitizedData,
        updatedAt: Timestamp.now(),
    });

    // BẮT BUỘC: Ghi log
    await writeLog(action, userId, {
        documentId,
        collectionName,
        previousData: docSnap.data(),
        newData: sanitizedData,
    });
};

/**
 * Generic DELETE with logging - SOFT DELETE preferred
 */
export const deleteDocument = async (
    collectionName: string,
    documentId: string,
    userId: string,
    action: LogAction,
    hardDelete: boolean = false
): Promise<void> => {
    const docRef = doc(db, collectionName, documentId);

    // Lấy data trước khi xóa để log
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        throw new Error(`Document ${documentId} không tồn tại`);
    }

    const previousData = docSnap.data();

    if (hardDelete) {
        await deleteDoc(docRef);
    } else {
        // Soft delete - đánh dấu inactive
        await updateDoc(docRef, {
            status: 'inactive',
            deletedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
    }

    // BẮT BUỘC: Ghi log
    await writeLog(action, userId, {
        documentId,
        collectionName,
        deletedData: previousData,
        hardDelete,
    });
};

/**
 * Generic READ single document
 */
export const getDocument = async <T>(
    collectionName: string,
    documentId: string
): Promise<T | null> => {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
    }

    return null;
};

/**
 * Generic READ all documents with filters
 */
export const getDocuments = async <T>(
    collectionName: string,
    ...constraints: QueryConstraint[]
): Promise<T[]> => {
    const q = query(collection(db, collectionName), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    } as T));
};

// ============================================
// REALTIME SYNC - onSnapshot
// ============================================

/**
 * Subscribe to realtime updates
 * Trả về unsubscribe function
 */
export const subscribeToCollection = <T>(
    collectionName: string,
    callback: (data: T[]) => void,
    onError: (error: Error) => void,
    ...constraints: QueryConstraint[]
): Unsubscribe => {
    const q = query(collection(db, collectionName), ...constraints);

    return onSnapshot(
        q,
        (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as T));
            callback(data);
        },
        (error) => {
            console.error(`❌ Realtime sync error for ${collectionName}:`, error);
            onError(error);
        }
    );
};

/**
 * Subscribe to single document
 */
export const subscribeToDocument = <T>(
    collectionName: string,
    documentId: string,
    callback: (data: T | null) => void,
    onError: (error: Error) => void
): Unsubscribe => {
    const docRef = doc(db, collectionName, documentId);

    return onSnapshot(
        docRef,
        (snapshot) => {
            if (snapshot.exists()) {
                callback({ id: snapshot.id, ...snapshot.data() } as T);
            } else {
                callback(null);
            }
        },
        (error) => {
            console.error(`❌ Realtime sync error for ${collectionName}/${documentId}:`, error);
            onError(error);
        }
    );
};

// ============================================
// TRANSACTION SUPPORT - BẮT BUỘC CHO ORDERS
// ============================================

/**
 * Thực hiện transaction an toàn
 * Rollback tự động nếu có lỗi
 */
export const executeTransaction = async <T>(
    transactionFn: (transaction: any) => Promise<T>
): Promise<T> => {
    try {
        const result = await runTransaction(db, transactionFn);
        console.log('✅ Transaction completed successfully');
        return result;
    } catch (error) {
        console.error('❌ Transaction failed, rolled back:', error);
        throw error;
    }
};

/**
 * Batch write - cho nhiều operations cùng lúc
 */
export const executeBatch = async (
    operations: Array<{
        type: 'set' | 'update' | 'delete';
        ref: DocumentReference;
        data?: Record<string, any>;
    }>
): Promise<void> => {
    const batch = writeBatch(db);

    for (const op of operations) {
        switch (op.type) {
            case 'set':
                batch.set(op.ref, op.data!);
                break;
            case 'update':
                batch.update(op.ref, op.data!);
                break;
            case 'delete':
                batch.delete(op.ref);
                break;
        }
    }

    await batch.commit();
    console.log(`✅ Batch write completed: ${operations.length} operations`);
};

// ============================================
// DATA SANITIZATION
// ============================================

/**
 * Sanitize dữ liệu trước khi ghi vào Firestore
 * Loại bỏ undefined, XSS, trim strings
 */
const sanitizeData = <T extends Record<string, any>>(data: T): T => {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
        if (value === undefined) continue;

        if (typeof value === 'string') {
            // Trim và escape HTML
            sanitized[key] = escapeHtml(value.trim());
        } else if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Timestamp)) {
            // Recursive sanitize nested objects
            sanitized[key] = sanitizeData(value);
        } else if (Array.isArray(value)) {
            // Sanitize arrays
            sanitized[key] = value.map(item =>
                typeof item === 'object' ? sanitizeData(item) : item
            );
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized as T;
};

/**
 * Escape HTML để prevent XSS
 */
const escapeHtml = (str: string): string => {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return str.replace(/[&<>"']/g, char => map[char]);
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const getServerTimestamp = (): Timestamp => Timestamp.now();

export const timestampToDate = (timestamp: Timestamp): Date =>
    timestamp.toDate();

export const dateToTimestamp = (date: Date): Timestamp =>
    Timestamp.fromDate(date);
