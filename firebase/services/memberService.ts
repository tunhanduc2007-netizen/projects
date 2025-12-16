// Member Service - Quản lý thành viên
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

export interface Member {
    id?: string;
    name: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    address?: string;
    membershipType: 'basic' | 'premium' | 'vip';
    membershipFee: number;
    membershipStartDate: Date | Timestamp;
    membershipEndDate: Date | Timestamp;
    status: 'active' | 'inactive' | 'pending';
    notes?: string;
    createdAt: Date | Timestamp;
    updatedAt: Date | Timestamp;
}

const COLLECTION_NAME = 'members';

// Lấy tất cả thành viên
export const getAllMembers = async (): Promise<Member[]> => {
    const membersRef = collection(db, COLLECTION_NAME);
    const q = query(membersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Member));
};

// Lấy thành viên theo ID
export const getMemberById = async (id: string): Promise<Member | null> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Member;
    }
    return null;
};

// Thêm thành viên mới
export const addMember = async (member: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const membersRef = collection(db, COLLECTION_NAME);
    const now = Timestamp.now();
    const docRef = await addDoc(membersRef, {
        ...member,
        createdAt: now,
        updatedAt: now
    });
    return docRef.id;
};

// Cập nhật thành viên
export const updateMember = async (id: string, member: Partial<Member>): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
        ...member,
        updatedAt: Timestamp.now()
    });
};

// Xóa thành viên
export const deleteMember = async (id: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
};

// Tìm thành viên theo email
export const getMemberByEmail = async (email: string): Promise<Member | null> => {
    const membersRef = collection(db, COLLECTION_NAME);
    const q = query(membersRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Member;
    }
    return null;
};

// Lấy thành viên theo trạng thái
export const getMembersByStatus = async (status: Member['status']): Promise<Member[]> => {
    const membersRef = collection(db, COLLECTION_NAME);
    const q = query(membersRef, where('status', '==', status));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Member));
};

// Thống kê thành viên
export const getMemberStats = async () => {
    const members = await getAllMembers();
    return {
        total: members.length,
        active: members.filter(m => m.status === 'active').length,
        inactive: members.filter(m => m.status === 'inactive').length,
        pending: members.filter(m => m.status === 'pending').length,
        basic: members.filter(m => m.membershipType === 'basic').length,
        premium: members.filter(m => m.membershipType === 'premium').length,
        vip: members.filter(m => m.membershipType === 'vip').length
    };
};
