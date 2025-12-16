/**
 * 🔥 FIREBASE MODULE - MAIN EXPORT
 * Production-ready exports
 */

// Config
export { db, auth, storage, isFirebaseAvailable } from './config';

// Types
export * from './types/database';

// Services
export { API } from './services/api';
export { AuthService } from './services/auth';
export * from './services/validation';

// Hooks
export * from './firebase/hooks';
