// Schedule Service - Quản lý lịch tập
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from '../config';

export interface TrainingSlot {
    id?: string;
    dayOfWeek: number; // 0-6 (Chủ nhật - Thứ 7)
    startTime: string; // "08:00"
    endTime: string; // "10:00"
    coachId?: string;
    coachName: string;
    maxParticipants: number;
    currentParticipants: number;
    location: string;
    type: 'group' | 'private' | 'trial';
    price: number;
    status: 'available' | 'full' | 'cancelled';
    notes?: string;
}

export interface Booking {
    id?: string;
    slotId: string;
    memberId: string;
    memberName: string;
    memberPhone: string;
    bookingDate: Date | Timestamp;
    status: 'confirmed' | 'pending' | 'cancelled';
    notes?: string;
    createdAt: Date | Timestamp;
}

const SLOTS_COLLECTION = 'training_slots';
const BOOKINGS_COLLECTION = 'bookings';

// ========== TRAINING SLOTS ==========

// Lấy tất cả slot tập luyện
export const getAllSlots = async (): Promise<TrainingSlot[]> => {
    const slotsRef = collection(db, SLOTS_COLLECTION);
    const q = query(slotsRef, orderBy('dayOfWeek'), orderBy('startTime'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as TrainingSlot));
};

// Lấy slot theo ngày trong tuần
export const getSlotsByDay = async (dayOfWeek: number): Promise<TrainingSlot[]> => {
    const slotsRef = collection(db, SLOTS_COLLECTION);
    const q = query(slotsRef, where('dayOfWeek', '==', dayOfWeek), orderBy('startTime'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as TrainingSlot));
};

// Thêm slot mới
export const addSlot = async (slot: Omit<TrainingSlot, 'id'>): Promise<string> => {
    const slotsRef = collection(db, SLOTS_COLLECTION);
    const docRef = await addDoc(slotsRef, slot);
    return docRef.id;
};

// Cập nhật slot
export const updateSlot = async (id: string, slot: Partial<TrainingSlot>): Promise<void> => {
    const docRef = doc(db, SLOTS_COLLECTION, id);
    await updateDoc(docRef, slot);
};

// Xóa slot
export const deleteSlot = async (id: string): Promise<void> => {
    const docRef = doc(db, SLOTS_COLLECTION, id);
    await deleteDoc(docRef);
};

// ========== BOOKINGS ==========

// Lấy tất cả booking
export const getAllBookings = async (): Promise<Booking[]> => {
    const bookingsRef = collection(db, BOOKINGS_COLLECTION);
    const q = query(bookingsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Booking));
};

// Đặt lịch tập
export const createBooking = async (booking: Omit<Booking, 'id' | 'createdAt'>): Promise<string> => {
    const bookingsRef = collection(db, BOOKINGS_COLLECTION);
    const docRef = await addDoc(bookingsRef, {
        ...booking,
        createdAt: Timestamp.now()
    });

    // Cập nhật số người tham gia trong slot
    const slotRef = doc(db, SLOTS_COLLECTION, booking.slotId);
    const slotSnap = await getDoc(slotRef);
    if (slotSnap.exists()) {
        const slotData = slotSnap.data() as TrainingSlot;
        const newCount = slotData.currentParticipants + 1;
        await updateDoc(slotRef, {
            currentParticipants: newCount,
            status: newCount >= slotData.maxParticipants ? 'full' : 'available'
        });
    }

    return docRef.id;
};

// Hủy booking
export const cancelBooking = async (bookingId: string): Promise<void> => {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (bookingSnap.exists()) {
        const bookingData = bookingSnap.data() as Booking;

        // Cập nhật trạng thái booking
        await updateDoc(bookingRef, { status: 'cancelled' });

        // Giảm số người tham gia trong slot
        const slotRef = doc(db, SLOTS_COLLECTION, bookingData.slotId);
        const slotSnap = await getDoc(slotRef);
        if (slotSnap.exists()) {
            const slotData = slotSnap.data() as TrainingSlot;
            await updateDoc(slotRef, {
                currentParticipants: Math.max(0, slotData.currentParticipants - 1),
                status: 'available'
            });
        }
    }
};

// Lấy booking theo member
export const getBookingsByMember = async (memberId: string): Promise<Booking[]> => {
    const bookingsRef = collection(db, BOOKINGS_COLLECTION);
    const q = query(bookingsRef, where('memberId', '==', memberId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Booking));
};

// Lấy booking theo slot
export const getBookingsBySlot = async (slotId: string): Promise<Booking[]> => {
    const bookingsRef = collection(db, BOOKINGS_COLLECTION);
    const q = query(bookingsRef, where('slotId', '==', slotId), where('status', '==', 'confirmed'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Booking));
};
