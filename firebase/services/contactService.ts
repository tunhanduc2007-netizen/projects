// Contact Service - Quản lý liên hệ/hỗ trợ
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

export interface ContactMessage {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    type: 'general' | 'support' | 'membership' | 'coaching' | 'feedback' | 'complaint';
    status: 'new' | 'read' | 'replied' | 'resolved' | 'archived';
    priority: 'low' | 'medium' | 'high';
    adminNotes?: string;
    repliedAt?: Date | Timestamp;
    createdAt: Date | Timestamp;
}

export interface FAQ {
    id?: string;
    question: string;
    answer: string;
    category: string;
    order: number;
    isActive: boolean;
}

const CONTACTS_COLLECTION = 'contact_messages';
const FAQ_COLLECTION = 'faqs';

// ========== CONTACT MESSAGES ==========

// Lấy tất cả tin nhắn liên hệ
export const getAllMessages = async (): Promise<ContactMessage[]> => {
    const messagesRef = collection(db, CONTACTS_COLLECTION);
    const q = query(messagesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as ContactMessage));
};

// Lấy tin nhắn theo ID
export const getMessageById = async (id: string): Promise<ContactMessage | null> => {
    const docRef = doc(db, CONTACTS_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as ContactMessage;
    }
    return null;
};

// Gửi tin nhắn liên hệ mới
export const sendContactMessage = async (
    message: Omit<ContactMessage, 'id' | 'status' | 'priority' | 'createdAt'>
): Promise<string> => {
    const messagesRef = collection(db, CONTACTS_COLLECTION);
    const docRef = await addDoc(messagesRef, {
        ...message,
        status: 'new',
        priority: 'medium',
        createdAt: Timestamp.now()
    });
    return docRef.id;
};

// Cập nhật trạng thái tin nhắn
export const updateMessageStatus = async (
    id: string,
    status: ContactMessage['status']
): Promise<void> => {
    const docRef = doc(db, CONTACTS_COLLECTION, id);
    const updateData: Record<string, unknown> = { status };

    if (status === 'replied') {
        updateData.repliedAt = Timestamp.now();
    }

    await updateDoc(docRef, updateData);
};

// Cập nhật ghi chú admin
export const updateAdminNotes = async (id: string, notes: string): Promise<void> => {
    const docRef = doc(db, CONTACTS_COLLECTION, id);
    await updateDoc(docRef, { adminNotes: notes });
};

// Xóa tin nhắn
export const deleteMessage = async (id: string): Promise<void> => {
    const docRef = doc(db, CONTACTS_COLLECTION, id);
    await deleteDoc(docRef);
};

// Lấy tin nhắn theo trạng thái
export const getMessagesByStatus = async (status: ContactMessage['status']): Promise<ContactMessage[]> => {
    const messagesRef = collection(db, CONTACTS_COLLECTION);
    const q = query(messagesRef, where('status', '==', status), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as ContactMessage));
};

// Lấy tin nhắn mới (chưa đọc)
export const getNewMessages = async (): Promise<ContactMessage[]> => {
    return getMessagesByStatus('new');
};

// Thống kê tin nhắn
export const getContactStats = async () => {
    const messages = await getAllMessages();
    return {
        total: messages.length,
        new: messages.filter(m => m.status === 'new').length,
        read: messages.filter(m => m.status === 'read').length,
        replied: messages.filter(m => m.status === 'replied').length,
        resolved: messages.filter(m => m.status === 'resolved').length,
        highPriority: messages.filter(m => m.priority === 'high').length
    };
};

// ========== FAQs ==========

// Lấy tất cả FAQ
export const getAllFAQs = async (): Promise<FAQ[]> => {
    const faqsRef = collection(db, FAQ_COLLECTION);
    const q = query(faqsRef, where('isActive', '==', true), orderBy('order'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as FAQ));
};

// Thêm FAQ
export const addFAQ = async (faq: Omit<FAQ, 'id'>): Promise<string> => {
    const faqsRef = collection(db, FAQ_COLLECTION);
    const docRef = await addDoc(faqsRef, faq);
    return docRef.id;
};

// Cập nhật FAQ
export const updateFAQ = async (id: string, faq: Partial<FAQ>): Promise<void> => {
    const docRef = doc(db, FAQ_COLLECTION, id);
    await updateDoc(docRef, faq);
};

// Xóa FAQ
export const deleteFAQ = async (id: string): Promise<void> => {
    const docRef = doc(db, FAQ_COLLECTION, id);
    await deleteDoc(docRef);
};
