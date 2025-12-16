/**
 * ============================================
 * CONTACTS SERVICE - Production Ready
 * ============================================
 */

import { orderBy, where, Unsubscribe, Timestamp } from 'firebase/firestore';
import { db } from '../config';
import {
    Contact,
    ContactInput,
    COLLECTION_NAMES,
    validateContact,
} from '../types';
import {
    createDocument,
    updateDocument,
    deleteDocument,
    getDocument,
    getDocuments,
    subscribeToCollection,
    writeLog,
} from './core';
import { doc, updateDoc } from 'firebase/firestore';

const COLLECTION = COLLECTION_NAMES.CONTACTS;

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Tạo contact từ form liên hệ
 * Không cần auth - public form
 */
export const createContact = async (
    data: ContactInput
): Promise<{ success: boolean; id?: string; errors?: string[] }> => {
    const validation = validateContact(data);
    if (!validation.valid) {
        return { success: false, errors: validation.errors };
    }

    try {
        const contactData = {
            ...data,
            isRead: false, // Mặc định chưa đọc
            createdAt: Timestamp.now(),
        };

        const id = await createDocument(
            COLLECTION,
            contactData,
            'guest', // Guest user
            'CREATE_CONTACT'
        );

        return { success: true, id };
    } catch (error: any) {
        console.error('❌ Create contact error:', error);
        return { success: false, errors: [error.message] };
    }
};

/**
 * Đánh dấu đã đọc
 */
export const markContactAsRead = async (
    id: string,
    markedBy: string
): Promise<{ success: boolean; errors?: string[] }> => {
    try {
        await updateDocument<Contact>(
            COLLECTION,
            id,
            { isRead: true },
            markedBy,
            'UPDATE_CONTACT'
        );

        return { success: true };
    } catch (error: any) {
        console.error('❌ Mark contact as read error:', error);
        return { success: false, errors: [error.message] };
    }
};

/**
 * Xóa contact
 */
export const deleteContact = async (
    id: string,
    deletedBy: string
): Promise<{ success: boolean; errors?: string[] }> => {
    try {
        await deleteDocument(
            COLLECTION,
            id,
            deletedBy,
            'DELETE_CONTACT',
            true // Hard delete
        );

        return { success: true };
    } catch (error: any) {
        console.error('❌ Delete contact error:', error);
        return { success: false, errors: [error.message] };
    }
};

// ============================================
// READ OPERATIONS
// ============================================

export const getContactById = async (id: string): Promise<Contact | null> => {
    return getDocument<Contact>(COLLECTION, id);
};

export const getAllContacts = async (): Promise<Contact[]> => {
    return getDocuments<Contact>(COLLECTION, orderBy('createdAt', 'desc'));
};

export const getUnreadContacts = async (): Promise<Contact[]> => {
    return getDocuments<Contact>(
        COLLECTION,
        where('isRead', '==', false),
        orderBy('createdAt', 'desc')
    );
};

// ============================================
// REALTIME SYNC
// ============================================

export const subscribeToContacts = (
    callback: (contacts: Contact[]) => void,
    onError: (error: Error) => void
): Unsubscribe => {
    return subscribeToCollection<Contact>(
        COLLECTION,
        callback,
        onError,
        orderBy('createdAt', 'desc')
    );
};

export const subscribeToUnreadContacts = (
    callback: (contacts: Contact[]) => void,
    onError: (error: Error) => void
): Unsubscribe => {
    return subscribeToCollection<Contact>(
        COLLECTION,
        callback,
        onError,
        where('isRead', '==', false),
        orderBy('createdAt', 'desc')
    );
};

// ============================================
// STATISTICS
// ============================================

export const getContactStats = async (): Promise<{
    total: number;
    unread: number;
    read: number;
}> => {
    const contacts = await getAllContacts();

    return {
        total: contacts.length,
        unread: contacts.filter(c => !c.isRead).length,
        read: contacts.filter(c => c.isRead).length,
    };
};
