// Firebase Configuration
// QUAN TRỌNG: Chỉ kết nối Firebase khi chạy localhost với Emulator
// Production sử dụng dữ liệu tĩnh

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage';

// Kiểm tra môi trường
const isClient = typeof window !== 'undefined';
const isLocalhost = isClient && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
);

// Config cho Firebase Emulator (chỉ dùng cho local development)
const firebaseConfig = {
    apiKey: "demo-api-key",
    authDomain: "demo-clb-lqd.firebaseapp.com",
    projectId: "demo-clb-lqd",
    storageBucket: "demo-clb-lqd.appspot.com",
    messagingSenderId: "123456789",
    appId: "demo-app-id"
};

// Biến để theo dõi trạng thái kết nối
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;
let isEmulatorConnected = false;

// Chỉ khởi tạo Firebase khi chạy localhost
if (isLocalhost) {
    try {
        console.log('🔥 Đang khởi tạo Firebase cho localhost...');

        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        storage = getStorage(app);

        // Kết nối Emulator
        if (!isEmulatorConnected) {
            connectFirestoreEmulator(db, 'localhost', 8080);
            connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
            connectStorageEmulator(storage, 'localhost', 9199);
            isEmulatorConnected = true;
            console.log('✅ Đã kết nối với Firebase Emulator!');
        }
    } catch (error) {
        console.warn('⚠️ Lỗi khởi tạo Firebase:', error);
    }
} else {
    // Production - không kết nối Firebase, hiển thị thông báo
    console.log('ℹ️ Production mode - Firebase disabled. Using static data.');
}

// Export với null check
export { db, auth, storage };
export default app;

// Helper function để kiểm tra Firebase có sẵn không
export const isFirebaseAvailable = (): boolean => {
    return isLocalhost && db !== null;
};

