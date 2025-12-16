// Auth Service - Xác thực và quản lý Admin
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    Timestamp
} from 'firebase/firestore';
import { auth, db } from '../config';

export interface AdminUser {
    uid: string;
    email: string;
    displayName: string;
    role: 'super_admin' | 'admin' | 'editor';
    permissions: string[];
    lastLogin?: Date | Timestamp;
    createdAt: Date | Timestamp;
}

const ADMINS_COLLECTION = 'admins';

// Đăng nhập Admin
export const loginAdmin = async (email: string, password: string): Promise<AdminUser | null> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Kiểm tra xem user có quyền admin không
        const adminDoc = await getDoc(doc(db, ADMINS_COLLECTION, user.uid));
        if (!adminDoc.exists()) {
            await signOut(auth);
            throw new Error('Bạn không có quyền truy cập trang quản trị');
        }

        // Cập nhật thời gian đăng nhập
        await updateDoc(doc(db, ADMINS_COLLECTION, user.uid), {
            lastLogin: Timestamp.now()
        });

        return {
            uid: user.uid,
            ...adminDoc.data()
        } as AdminUser;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// Đăng xuất
export const logoutAdmin = async (): Promise<void> => {
    await signOut(auth);
};

// Kiểm tra trạng thái đăng nhập
export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};

// Lắng nghe thay đổi trạng thái auth
export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

// Lấy thông tin admin
export const getAdminInfo = async (uid: string): Promise<AdminUser | null> => {
    const adminDoc = await getDoc(doc(db, ADMINS_COLLECTION, uid));
    if (adminDoc.exists()) {
        return {
            uid,
            ...adminDoc.data()
        } as AdminUser;
    }
    return null;
};

// Tạo admin mới (chỉ super_admin)
export const createAdmin = async (
    email: string,
    password: string,
    displayName: string,
    role: AdminUser['role'] = 'editor'
): Promise<string> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName });

    const adminData: Omit<AdminUser, 'uid'> = {
        email,
        displayName,
        role,
        permissions: getDefaultPermissions(role),
        createdAt: Timestamp.now()
    };

    await setDoc(doc(db, ADMINS_COLLECTION, user.uid), adminData);

    return user.uid;
};

// Cập nhật quyền admin
export const updateAdminRole = async (uid: string, role: AdminUser['role']): Promise<void> => {
    await updateDoc(doc(db, ADMINS_COLLECTION, uid), {
        role,
        permissions: getDefaultPermissions(role)
    });
};

// Gửi email reset password
export const resetPassword = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
};

// Helper: Lấy permissions mặc định theo role
const getDefaultPermissions = (role: AdminUser['role']): string[] => {
    switch (role) {
        case 'super_admin':
            return ['all'];
        case 'admin':
            return ['members', 'schedule', 'shop', 'contacts', 'settings'];
        case 'editor':
            return ['members.read', 'schedule.read', 'shop.read', 'contacts.read'];
        default:
            return [];
    }
};

// Kiểm tra quyền
export const hasPermission = async (uid: string, permission: string): Promise<boolean> => {
    const admin = await getAdminInfo(uid);
    if (!admin) return false;

    if (admin.permissions.includes('all')) return true;
    return admin.permissions.includes(permission) ||
        admin.permissions.includes(permission.split('.')[0]);
};
