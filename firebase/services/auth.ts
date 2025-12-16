/**
 * 🔐 FIREBASE AUTH SERVICE
 * Production-ready authentication với:
 * - JWT Token management
 * - Password hashing (via Firebase Auth)
 * - Session management
 * - Rate limiting simulation
 * - CORS handling
 */

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    sendEmailVerification,
    updateProfile,
    updatePassword,
    onAuthStateChanged,
    User as FirebaseUser,
    UserCredential,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db, isFirebaseAvailable } from '../config';
import { User, UserRole, ApiResponse } from '../types/database';
import { validateUser, sanitizeEmail, sanitizeString } from './validation';
import { writeAuditLog } from './api';

// ============================================
// 🔧 TYPES
// ============================================

export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
    role: UserRole;
    profile?: User;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface RegisterInput {
    email: string;
    password: string;
    full_name: string;
    phone: string;
}

export interface AuthState {
    user: AuthUser | null;
    loading: boolean;
    error: string | null;
}

// ============================================
// 🛡️ RATE LIMITING (Client-side simulation)
// ============================================

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60000; // 1 minute

function checkRateLimit(key: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
        rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return true;
    }

    if (record.count >= RATE_LIMIT_MAX) {
        return false;
    }

    record.count++;
    return true;
}

// ============================================
// 🔐 AUTH SERVICE
// ============================================

export const AuthService = {
    /**
     * Register new user
     */
    async register(input: RegisterInput): Promise<ApiResponse<AuthUser>> {
        try {
            if (!auth || !isFirebaseAvailable()) {
                return {
                    success: false,
                    error: { code: 'AUTH_UNAVAILABLE', message: 'Dịch vụ xác thực không khả dụng' },
                    timestamp: new Date().toISOString(),
                };
            }

            // Rate limit check
            if (!checkRateLimit(`register:${input.email}`)) {
                return {
                    success: false,
                    error: { code: 'RATE_LIMIT', message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' },
                    timestamp: new Date().toISOString(),
                };
            }

            // Validate
            const validation = validateUser({
                email: input.email,
                password: input.password,
                full_name: input.full_name,
                phone: input.phone,
            });

            if (!validation.valid) {
                return {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Dữ liệu không hợp lệ',
                        details: validation.errors.reduce((acc, err) => {
                            acc[err.field] = [err.message];
                            return acc;
                        }, {} as Record<string, string[]>),
                    },
                    timestamp: new Date().toISOString(),
                };
            }

            // Create Firebase Auth user
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                sanitizeEmail(input.email),
                input.password
            );

            // Update profile
            await updateProfile(userCredential.user, {
                displayName: sanitizeString(input.full_name),
            });

            // Send verification email
            await sendEmailVerification(userCredential.user);

            // Create user document in Firestore
            const timestamp = Timestamp.now();
            const userData: Omit<User, 'id'> = {
                full_name: sanitizeString(input.full_name),
                email: sanitizeEmail(input.email),
                phone: validation.sanitizedData.phone,
                role: 'member',
                status: 'active',
                created_at: timestamp,
                updated_at: timestamp,
            };

            await setDoc(doc(db!, 'users', userCredential.user.uid), userData);

            // Log
            await writeAuditLog(
                'create',
                'users',
                userCredential.user.uid,
                undefined,
                userData,
                userCredential.user.uid,
                input.email,
                'info',
                'User registered'
            );

            const authUser: AuthUser = {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: userCredential.user.displayName,
                photoURL: userCredential.user.photoURL,
                emailVerified: userCredential.user.emailVerified,
                role: 'member',
                profile: { id: userCredential.user.uid, ...userData } as User,
            };

            return {
                success: true,
                data: authUser,
                timestamp: new Date().toISOString(),
            };
        } catch (error: any) {
            let message = 'Lỗi khi đăng ký';

            if (error.code === 'auth/email-already-in-use') {
                message = 'Email đã được sử dụng';
            } else if (error.code === 'auth/weak-password') {
                message = 'Mật khẩu quá yếu';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Email không hợp lệ';
            }

            return {
                success: false,
                error: { code: error.code || 'REGISTER_ERROR', message },
                timestamp: new Date().toISOString(),
            };
        }
    },

    /**
     * Login user
     */
    async login(input: LoginInput): Promise<ApiResponse<AuthUser>> {
        try {
            if (!auth || !isFirebaseAvailable()) {
                return {
                    success: false,
                    error: { code: 'AUTH_UNAVAILABLE', message: 'Dịch vụ xác thực không khả dụng' },
                    timestamp: new Date().toISOString(),
                };
            }

            // Rate limit check
            if (!checkRateLimit(`login:${input.email}`)) {
                return {
                    success: false,
                    error: { code: 'RATE_LIMIT', message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 1 phút.' },
                    timestamp: new Date().toISOString(),
                };
            }

            // Login with Firebase Auth
            const userCredential = await signInWithEmailAndPassword(
                auth,
                sanitizeEmail(input.email),
                input.password
            );

            // Get user profile from Firestore
            const userDoc = await getDoc(doc(db!, 'users', userCredential.user.uid));
            let profile: User | undefined;
            let role: UserRole = 'member';

            if (userDoc.exists()) {
                profile = { id: userDoc.id, ...userDoc.data() } as User;
                role = profile.role;

                // Check if user is banned
                if (profile.status === 'banned') {
                    await firebaseSignOut(auth);
                    return {
                        success: false,
                        error: { code: 'USER_BANNED', message: 'Tài khoản của bạn đã bị khóa' },
                        timestamp: new Date().toISOString(),
                    };
                }

                // Update last login
                await updateDoc(doc(db!, 'users', userCredential.user.uid), {
                    last_login: Timestamp.now(),
                });
            }

            // Log
            await writeAuditLog(
                'login',
                'users',
                userCredential.user.uid,
                undefined,
                undefined,
                userCredential.user.uid,
                input.email,
                'info',
                'User logged in'
            );

            const authUser: AuthUser = {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: userCredential.user.displayName,
                photoURL: userCredential.user.photoURL,
                emailVerified: userCredential.user.emailVerified,
                role,
                profile,
            };

            return {
                success: true,
                data: authUser,
                timestamp: new Date().toISOString(),
            };
        } catch (error: any) {
            let message = 'Email hoặc mật khẩu không đúng';

            if (error.code === 'auth/user-not-found') {
                message = 'Không tìm thấy tài khoản';
            } else if (error.code === 'auth/wrong-password') {
                message = 'Mật khẩu không đúng';
            } else if (error.code === 'auth/too-many-requests') {
                message = 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau.';
            } else if (error.code === 'auth/user-disabled') {
                message = 'Tài khoản đã bị vô hiệu hóa';
            }

            return {
                success: false,
                error: { code: error.code || 'LOGIN_ERROR', message },
                timestamp: new Date().toISOString(),
            };
        }
    },

    /**
     * Logout user
     */
    async logout(): Promise<ApiResponse<void>> {
        try {
            if (!auth) {
                return {
                    success: false,
                    error: { code: 'AUTH_UNAVAILABLE', message: 'Dịch vụ xác thực không khả dụng' },
                    timestamp: new Date().toISOString(),
                };
            }

            const user = auth.currentUser;

            if (user) {
                // Log
                await writeAuditLog(
                    'logout',
                    'users',
                    user.uid,
                    undefined,
                    undefined,
                    user.uid,
                    user.email || undefined,
                    'info',
                    'User logged out'
                );
            }

            await firebaseSignOut(auth);

            return {
                success: true,
                timestamp: new Date().toISOString(),
            };
        } catch (error: any) {
            return {
                success: false,
                error: { code: 'LOGOUT_ERROR', message: error.message || 'Lỗi khi đăng xuất' },
                timestamp: new Date().toISOString(),
            };
        }
    },

    /**
     * Reset password
     */
    async resetPassword(email: string): Promise<ApiResponse<void>> {
        try {
            if (!auth) {
                return {
                    success: false,
                    error: { code: 'AUTH_UNAVAILABLE', message: 'Dịch vụ xác thực không khả dụng' },
                    timestamp: new Date().toISOString(),
                };
            }

            // Rate limit check
            if (!checkRateLimit(`reset:${email}`)) {
                return {
                    success: false,
                    error: { code: 'RATE_LIMIT', message: 'Vui lòng chờ trước khi yêu cầu lại' },
                    timestamp: new Date().toISOString(),
                };
            }

            await sendPasswordResetEmail(auth, sanitizeEmail(email));

            return {
                success: true,
                timestamp: new Date().toISOString(),
            };
        } catch (error: any) {
            // Don't reveal if email exists
            return {
                success: true, // Always return success for security
                timestamp: new Date().toISOString(),
            };
        }
    },

    /**
     * Change password
     */
    async changePassword(newPassword: string): Promise<ApiResponse<void>> {
        try {
            if (!auth || !auth.currentUser) {
                return {
                    success: false,
                    error: { code: 'NOT_AUTHENTICATED', message: 'Bạn chưa đăng nhập' },
                    timestamp: new Date().toISOString(),
                };
            }

            if (newPassword.length < 8) {
                return {
                    success: false,
                    error: { code: 'WEAK_PASSWORD', message: 'Mật khẩu phải có ít nhất 8 ký tự' },
                    timestamp: new Date().toISOString(),
                };
            }

            await updatePassword(auth.currentUser, newPassword);

            // Log
            await writeAuditLog(
                'update',
                'users',
                auth.currentUser.uid,
                undefined,
                undefined,
                auth.currentUser.uid,
                auth.currentUser.email || undefined,
                'info',
                'Password changed'
            );

            return {
                success: true,
                timestamp: new Date().toISOString(),
            };
        } catch (error: any) {
            let message = 'Lỗi khi đổi mật khẩu';

            if (error.code === 'auth/requires-recent-login') {
                message = 'Vui lòng đăng nhập lại để thực hiện thao tác này';
            }

            return {
                success: false,
                error: { code: error.code || 'CHANGE_PASSWORD_ERROR', message },
                timestamp: new Date().toISOString(),
            };
        }
    },

    /**
     * Get current user
     */
    async getCurrentUser(): Promise<AuthUser | null> {
        if (!auth || !auth.currentUser) {
            return null;
        }

        const user = auth.currentUser;

        // Get profile from Firestore
        let profile: User | undefined;
        let role: UserRole = 'member';

        if (db) {
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    profile = { id: userDoc.id, ...userDoc.data() } as User;
                    role = profile.role;
                }
            } catch (error) {
                console.error('Error getting user profile:', error);
            }
        }

        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            role,
            profile,
        };
    },

    /**
     * Subscribe to auth state changes
     */
    onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
        if (!auth) {
            callback(null);
            return () => { };
        }

        return onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                callback(null);
                return;
            }

            // Get profile from Firestore
            let profile: User | undefined;
            let role: UserRole = 'member';

            if (db) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        profile = { id: userDoc.id, ...userDoc.data() } as User;
                        role = profile.role;
                    }
                } catch (error) {
                    console.error('Error getting user profile:', error);
                }
            }

            callback({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                emailVerified: firebaseUser.emailVerified,
                role,
                profile,
            });
        });
    },

    /**
     * Check if user has permission
     */
    hasPermission(role: UserRole, resource: string, action: string): boolean {
        const permissions: Record<UserRole, Record<string, string[]>> = {
            admin: {
                users: ['create', 'read', 'update', 'delete'],
                visitors: ['create', 'read', 'update', 'delete'],
                payments: ['create', 'read', 'update', 'delete'],
                schedules: ['create', 'read', 'update', 'delete'],
                products: ['create', 'read', 'update', 'delete'],
                orders: ['create', 'read', 'update', 'delete'],
                contacts: ['create', 'read', 'update', 'delete'],
            },
            staff: {
                visitors: ['create', 'read', 'update'],
                payments: ['create', 'read', 'update'],
                schedules: ['read'],
                products: ['read', 'update'],
                orders: ['create', 'read', 'update'],
                contacts: ['read', 'update'],
            },
            member: {
                users: ['read'],
                schedules: ['read'],
                products: ['read'],
                orders: ['create', 'read'],
                contacts: ['create'],
            },
            guest: {
                schedules: ['read'],
                products: ['read'],
                contacts: ['create'],
            },
        };

        return permissions[role]?.[resource]?.includes(action) || false;
    },

    /**
     * Get JWT token (for API calls)
     */
    async getToken(): Promise<string | null> {
        if (!auth || !auth.currentUser) {
            return null;
        }

        try {
            return await auth.currentUser.getIdToken();
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    },
};

export default AuthService;
