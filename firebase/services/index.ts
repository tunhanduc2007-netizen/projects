/**
 * ============================================
 * FIREBASE SERVICES - MAIN EXPORT
 * CLB Bóng Bàn Lê Quý Đôn
 * ============================================
 */

// Core exports
export * from './core';

// Type definitions
export * from '../types';

// Collection services
export * from './members';
export * from './schedules';
export * from './contacts';
export * from './products';
export * from './orders';
export * from './payments';

// Re-export config
export { db, auth, storage } from '../config';
