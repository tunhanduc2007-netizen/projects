// Firebase Configuration
// CLB Bóng Bàn Lê Quý Đôn - Production Ready

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

// 🔥 Firebase Config THẬT - Production
const firebaseConfig = {
    apiKey: "AIzaSyBFhh4DOg-kWyk_7yd-DnbD7up-vgaxIjI",
    authDomain: "clbbongbanlequydon.firebaseapp.com",
    projectId: "clbbongbanlequydon",
    storageBucket: "clbbongbanlequydon.firebasestorage.app",
    messagingSenderId: "779352302908",
    appId: "1:779352302908:web:714323101265b3e6b42a39",
    measurementId: "G-4PFEEMM5NB"
};

// Khởi tạo Firebase
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;
let isEmulatorConnected = false;

try {
    console.log('🔥 Đang khởi tạo Firebase...');

    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);

    // Kết nối Emulator khi chạy localhost (tùy chọn - bỏ comment nếu muốn dùng)
    // if (isLocalhost && !isEmulatorConnected) {
    //     connectFirestoreEmulator(db, 'localhost', 8080);
    //     connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    //     connectStorageEmulator(storage, 'localhost', 9199);
    //     isEmulatorConnected = true;
    //     console.log('✅ Đã kết nối với Firebase Emulator!');
    // }

    console.log('✅ Firebase đã sẵn sàng! Project:', firebaseConfig.projectId);

} catch (error) {
    console.error('❌ Lỗi khởi tạo Firebase:', error);
}

// Export
export { db, auth, storage };
export default app;

// Helper function để kiểm tra Firebase có sẵn không
export const isFirebaseAvailable = (): boolean => {
    return db !== null;
};
