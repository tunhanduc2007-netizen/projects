/**
 * ============================================
 * SCHEDULES SERVICE - Production Ready
 * ============================================
 */

import { orderBy, where, Unsubscribe } from 'firebase/firestore';
import {
    Schedule,
    ScheduleInput,
    DayOfWeek,
    COLLECTION_NAMES,
    validateSchedule,
} from '../types';
import {
    createDocument,
    updateDocument,
    deleteDocument,
    getDocument,
    getDocuments,
    subscribeToCollection,
} from './core';

const COLLECTION = COLLECTION_NAMES.SCHEDULES;

// ============================================
// CRUD OPERATIONS
// ============================================

export const createSchedule = async (
    data: ScheduleInput,
    createdBy: string
): Promise<{ success: boolean; id?: string; errors?: string[] }> => {
    const validation = validateSchedule(data);
    if (!validation.valid) {
        return { success: false, errors: validation.errors };
    }

    try {
        const id = await createDocument<ScheduleInput>(
            COLLECTION,
            data,
            createdBy,
            'CREATE_SCHEDULE'
        );

        return { success: true, id };
    } catch (error: any) {
        console.error('❌ Create schedule error:', error);
        return { success: false, errors: [error.message] };
    }
};

export const updateSchedule = async (
    id: string,
    data: Partial<ScheduleInput>,
    updatedBy: string
): Promise<{ success: boolean; errors?: string[] }> => {
    try {
        await updateDocument<Schedule>(
            COLLECTION,
            id,
            data,
            updatedBy,
            'UPDATE_SCHEDULE'
        );

        return { success: true };
    } catch (error: any) {
        console.error('❌ Update schedule error:', error);
        return { success: false, errors: [error.message] };
    }
};

export const deleteSchedule = async (
    id: string,
    deletedBy: string
): Promise<{ success: boolean; errors?: string[] }> => {
    try {
        await deleteDocument(
            COLLECTION,
            id,
            deletedBy,
            'DELETE_SCHEDULE',
            true // Hard delete for schedules
        );

        return { success: true };
    } catch (error: any) {
        console.error('❌ Delete schedule error:', error);
        return { success: false, errors: [error.message] };
    }
};

// ============================================
// READ OPERATIONS
// ============================================

export const getScheduleById = async (id: string): Promise<Schedule | null> => {
    return getDocument<Schedule>(COLLECTION, id);
};

export const getAllSchedules = async (): Promise<Schedule[]> => {
    return getDocuments<Schedule>(COLLECTION, orderBy('createdAt', 'desc'));
};

export const getSchedulesByDay = async (day: DayOfWeek): Promise<Schedule[]> => {
    return getDocuments<Schedule>(
        COLLECTION,
        where('dayOfWeek', '==', day),
        orderBy('startTime', 'asc')
    );
};

export const getSchedulesByCoach = async (coach: string): Promise<Schedule[]> => {
    return getDocuments<Schedule>(
        COLLECTION,
        where('coach', '==', coach),
        orderBy('createdAt', 'desc')
    );
};

// ============================================
// REALTIME SYNC
// ============================================

export const subscribeToSchedules = (
    callback: (schedules: Schedule[]) => void,
    onError: (error: Error) => void
): Unsubscribe => {
    return subscribeToCollection<Schedule>(
        COLLECTION,
        callback,
        onError,
        orderBy('createdAt', 'desc')
    );
};

// ============================================
// HELPER: Lấy lịch theo tuần
// ============================================

export const getWeeklySchedule = async (): Promise<Record<DayOfWeek, Schedule[]>> => {
    const allSchedules = await getAllSchedules();

    const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const weekly: Record<DayOfWeek, Schedule[]> = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
    };

    for (const schedule of allSchedules) {
        if (days.includes(schedule.dayOfWeek)) {
            weekly[schedule.dayOfWeek].push(schedule);
        }
    }

    // Sort by startTime
    for (const day of days) {
        weekly[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    return weekly;
};
