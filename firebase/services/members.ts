/**
 * ============================================
 * MEMBERS SERVICE - Production Ready
 * ============================================
 */

import { orderBy, where, Unsubscribe, Timestamp, runTransaction, doc, collection } from 'firebase/firestore';
import { db } from '../config';
import {
    Member,
    MemberInput,
    COLLECTION_NAMES,
    validateMember,
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

const COLLECTION = COLLECTION_NAMES.MEMBERS;

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Tạo thành viên mới
 * - Validate frontend
 * - Sanitize data
 * - Ghi Firestore
 * - Log action
 */
export const createMember = async (
    data: MemberInput,
    createdBy: string
): Promise<{ success: boolean; id?: string; errors?: string[] }> => {
    // 1. Validate frontend
    const validation = validateMember(data);
    if (!validation.valid) {
        return { success: false, errors: validation.errors };
    }

    try {
        // 2. Kiểm tra email trùng
        const existing = await getDocuments<Member>(
            COLLECTION,
            where('email', '==', data.email)
        );
        if (existing.length > 0) {
            return { success: false, errors: ['Email đã tồn tại trong hệ thống'] };
        }

        // 3. Kiểm tra phone trùng
        const existingPhone = await getDocuments<Member>(
            COLLECTION,
            where('phone', '==', data.phone)
        );
        if (existingPhone.length > 0) {
            return { success: false, errors: ['Số điện thoại đã tồn tại trong hệ thống'] };
        }

        // 4. Tạo document với logging
        const id = await createDocument<MemberInput>(
            COLLECTION,
            data,
            createdBy,
            'CREATE_MEMBER'
        );

        return { success: true, id };
    } catch (error: any) {
        console.error('❌ Create member error:', error);
        return { success: false, errors: [error.message] };
    }
};

/**
 * Cập nhật thành viên
 */
export const updateMember = async (
    id: string,
    data: Partial<MemberInput>,
    updatedBy: string
): Promise<{ success: boolean; errors?: string[] }> => {
    try {
        // Validate partial data
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            return { success: false, errors: ['Email không hợp lệ'] };
        }
        if (data.phone && !/^(0|\+84)[0-9]{9,10}$/.test(data.phone)) {
            return { success: false, errors: ['Số điện thoại không hợp lệ'] };
        }

        await updateDocument<Member>(
            COLLECTION,
            id,
            data,
            updatedBy,
            'UPDATE_MEMBER'
        );

        return { success: true };
    } catch (error: any) {
        console.error('❌ Update member error:', error);
        return { success: false, errors: [error.message] };
    }
};

/**
 * Xóa thành viên (soft delete)
 */
export const deleteMember = async (
    id: string,
    deletedBy: string
): Promise<{ success: boolean; errors?: string[] }> => {
    try {
        await deleteDocument(
            COLLECTION,
            id,
            deletedBy,
            'DELETE_MEMBER',
            false // Soft delete
        );

        return { success: true };
    } catch (error: any) {
        console.error('❌ Delete member error:', error);
        return { success: false, errors: [error.message] };
    }
};

/**
 * Lấy thành viên theo ID
 */
export const getMemberById = async (id: string): Promise<Member | null> => {
    return getDocument<Member>(COLLECTION, id);
};

/**
 * Lấy tất cả thành viên
 */
export const getAllMembers = async (): Promise<Member[]> => {
    return getDocuments<Member>(
        COLLECTION,
        orderBy('createdAt', 'desc')
    );
};

/**
 * Lấy thành viên theo status
 */
export const getMembersByStatus = async (status: 'active' | 'inactive'): Promise<Member[]> => {
    return getDocuments<Member>(
        COLLECTION,
        where('status', '==', status),
        orderBy('createdAt', 'desc')
    );
};

/**
 * Lấy thành viên theo role
 */
export const getMembersByRole = async (role: 'admin' | 'staff' | 'member'): Promise<Member[]> => {
    return getDocuments<Member>(
        COLLECTION,
        where('role', '==', role),
        orderBy('createdAt', 'desc')
    );
};

/**
 * Tìm thành viên theo email
 */
export const getMemberByEmail = async (email: string): Promise<Member | null> => {
    const members = await getDocuments<Member>(
        COLLECTION,
        where('email', '==', email)
    );
    return members.length > 0 ? members[0] : null;
};

// ============================================
// REALTIME SYNC
// ============================================

/**
 * Subscribe to members collection - realtime updates
 */
export const subscribeToMembers = (
    callback: (members: Member[]) => void,
    onError: (error: Error) => void
): Unsubscribe => {
    return subscribeToCollection<Member>(
        COLLECTION,
        callback,
        onError,
        orderBy('createdAt', 'desc')
    );
};

/**
 * Subscribe to active members only
 */
export const subscribeToActiveMembers = (
    callback: (members: Member[]) => void,
    onError: (error: Error) => void
): Unsubscribe => {
    return subscribeToCollection<Member>(
        COLLECTION,
        callback,
        onError,
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
    );
};

// ============================================
// STATISTICS
// ============================================

export const getMemberStats = async (): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: { admin: number; staff: number; member: number };
}> => {
    const members = await getAllMembers();

    return {
        total: members.length,
        active: members.filter(m => m.status === 'active').length,
        inactive: members.filter(m => m.status === 'inactive').length,
        byRole: {
            admin: members.filter(m => m.role === 'admin').length,
            staff: members.filter(m => m.role === 'staff').length,
            member: members.filter(m => m.role === 'member').length,
        },
    };
};
