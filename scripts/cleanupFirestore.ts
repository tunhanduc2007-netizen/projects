/**
 * 🔥 FIRESTORE CLEANUP SCRIPT
 * ========================================
 * Xóa TẤT CẢ documents và collections trong Firestore
 * Chạy một lần để làm sạch database
 * 
 * USAGE: node scripts/cleanupFirestore.js
 */

import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Collections cần xóa
const COLLECTIONS_TO_DELETE = [
    'users',
    'members',
    'visitors',
    'schedules',
    'products',
    'orders',
    'payments',
    'contacts',
    'reviews',
    'events',
    'bookings',
    'coaches',
    'club_info',
    'logs',
    'audit_logs',
    'notifications',
    'daily_stats',
    'test', // bất kỳ test collection nào
];

/**
 * Xóa tất cả documents trong một collection
 */
async function deleteCollection(collectionName: string): Promise<number> {
    if (!db) {
        throw new Error('Firebase not initialized');
    }

    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
        console.log(`  ⏭️  ${collectionName}: (trống)`);
        return 0;
    }

    const batch = writeBatch(db);
    let count = 0;

    snapshot.docs.forEach((docSnapshot) => {
        batch.delete(docSnapshot.ref);
        count++;
    });

    await batch.commit();
    console.log(`  🗑️  ${collectionName}: Đã xóa ${count} documents`);
    return count;
}

/**
 * Xóa tất cả data trong Firestore
 */
export async function cleanupFirestore(): Promise<{ success: boolean; message: string; totalDeleted: number }> {
    if (!db) {
        return { success: false, message: 'Firebase không khả dụng', totalDeleted: 0 };
    }

    console.log('\n🔥 BẮT ĐẦU XÓA TẤT CẢ DATA TRONG FIRESTORE\n');
    console.log('='.repeat(50));

    let totalDeleted = 0;

    try {
        for (const collectionName of COLLECTIONS_TO_DELETE) {
            try {
                const count = await deleteCollection(collectionName);
                totalDeleted += count;
            } catch (error: any) {
                console.log(`  ⚠️  ${collectionName}: Lỗi hoặc không tồn tại`);
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log(`✅ HOÀN TẤT! Đã xóa tổng cộng ${totalDeleted} documents`);
        console.log('🧹 Database đã được làm sạch hoàn toàn');
        console.log('='.repeat(50) + '\n');

        return {
            success: true,
            message: `Đã xóa ${totalDeleted} documents. Database sạch sẽ.`,
            totalDeleted,
        };
    } catch (error: any) {
        console.error('❌ LỖI:', error.message);
        return {
            success: false,
            message: error.message,
            totalDeleted,
        };
    }
}

export default cleanupFirestore;
