/**
 * ============================================
 * SEED DATABASE - Production Schema
 * ============================================
 */

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, isFirebaseAvailable } from '../firebase/config';
import { COLLECTION_NAMES } from '../firebase/types';

// Sample Members
const sampleMembers = [
    {
        fullName: 'Nguyễn Văn Admin',
        phone: '0901234567',
        email: 'admin@clbbongban.com',
        role: 'admin',
        status: 'active',
    },
    {
        fullName: 'Trần Thị Staff',
        phone: '0907654321',
        email: 'staff@clbbongban.com',
        role: 'staff',
        status: 'active',
    },
    {
        fullName: 'Lê Văn Member',
        phone: '0912345678',
        email: 'member@gmail.com',
        role: 'member',
        status: 'active',
    },
    {
        fullName: 'Phạm Minh Dũng',
        phone: '0934567890',
        email: 'dung.pham@gmail.com',
        role: 'member',
        status: 'active',
    },
    {
        fullName: 'Hoàng Thị Mai',
        phone: '0923456789',
        email: 'mai.hoang@gmail.com',
        role: 'member',
        status: 'inactive',
    },
];

// Sample Schedules
const sampleSchedules = [
    {
        dayOfWeek: 'Monday',
        startTime: '16:30',
        endTime: '20:00',
        coach: 'HLV Nguyễn Văn Sơn',
        note: 'Lớp cơ bản',
    },
    {
        dayOfWeek: 'Wednesday',
        startTime: '16:30',
        endTime: '20:00',
        coach: 'HLV Văn Huỳnh Phương Huy',
        note: 'Lớp nâng cao',
    },
    {
        dayOfWeek: 'Friday',
        startTime: '16:30',
        endTime: '20:00',
        coach: 'HLV Nguyễn Văn Sơn',
        note: 'Lớp tự do',
    },
    {
        dayOfWeek: 'Saturday',
        startTime: '08:00',
        endTime: '12:00',
        coach: 'HLV Văn Huỳnh Phương Huy',
        note: 'Lớp cuối tuần',
    },
    {
        dayOfWeek: 'Sunday',
        startTime: '08:00',
        endTime: '12:00',
        coach: 'HLV Nguyễn Văn Sơn',
        note: 'Tập tự do',
    },
];

// Sample Products
const sampleProducts = [
    {
        name: 'Vợt Butterfly Viscaria',
        price: 3500000,
        stock: 10,
        category: 'Vợt',
        imageUrl: '/images/vot-butterfly.jpg',
    },
    {
        name: 'Mặt vợt Tenergy 05',
        price: 1800000,
        stock: 25,
        category: 'Mặt vợt',
        imageUrl: '/images/mat-tenergy.jpg',
    },
    {
        name: 'Bóng Nittaku 3 sao',
        price: 150000,
        stock: 100,
        category: 'Bóng',
        imageUrl: '/images/bong-nittaku.jpg',
    },
    {
        name: 'Túi đựng vợt Butterfly',
        price: 450000,
        stock: 15,
        category: 'Phụ kiện',
        imageUrl: '/images/tui-vot.jpg',
    },
    {
        name: 'Giày bóng bàn Mizuno',
        price: 2200000,
        stock: 8,
        category: 'Giày',
        imageUrl: '/images/giay-mizuno.jpg',
    },
];

// Sample Contacts
const sampleContacts = [
    {
        name: 'Nguyễn Văn A',
        phone: '0987654321',
        message: 'Tôi muốn đăng ký học bóng bàn cho con trai 10 tuổi. Xin cho biết thêm thông tin về lớp học.',
        isRead: false,
    },
    {
        name: 'Trần Thị B',
        phone: '0976543210',
        message: 'CLB có nhận dạy 1-1 không ạ? Tôi muốn tìm HLV riêng để cải thiện kỹ thuật.',
        isRead: true,
    },
    {
        name: 'Lê Văn C',
        phone: '0965432109',
        message: 'Xin hỏi phí thành viên hàng tháng là bao nhiêu? Có ưu đãi gì cho sinh viên không?',
        isRead: false,
    },
];

/**
 * Seed tất cả dữ liệu mẫu
 */
export const seedDatabase = async (): Promise<boolean> => {
    // Kiểm tra Firebase có sẵn không
    if (!isFirebaseAvailable() || !db) {
        console.error('❌ Firebase không khả dụng. Chỉ có thể seed trên localhost với Emulator.');
        return false;
    }

    try {
        console.log('🌱 Bắt đầu seed database...');
        const now = Timestamp.now();

        // Seed Members
        console.log('👤 Seeding members...');
        for (const member of sampleMembers) {
            await addDoc(collection(db, COLLECTION_NAMES.MEMBERS), {
                ...member,
                createdAt: now,
                updatedAt: now,
            });
        }
        console.log(`✅ Đã thêm ${sampleMembers.length} members`);

        // Seed Schedules
        console.log('📅 Seeding schedules...');
        for (const schedule of sampleSchedules) {
            await addDoc(collection(db, COLLECTION_NAMES.SCHEDULES), {
                ...schedule,
                createdAt: now,
            });
        }
        console.log(`✅ Đã thêm ${sampleSchedules.length} schedules`);

        // Seed Products
        console.log('🏓 Seeding products...');
        for (const product of sampleProducts) {
            await addDoc(collection(db, COLLECTION_NAMES.PRODUCTS), {
                ...product,
                createdAt: now,
            });
        }
        console.log(`✅ Đã thêm ${sampleProducts.length} products`);

        // Seed Contacts
        console.log('📞 Seeding contacts...');
        for (const contact of sampleContacts) {
            await addDoc(collection(db, COLLECTION_NAMES.CONTACTS), {
                ...contact,
                createdAt: now,
            });
        }
        console.log(`✅ Đã thêm ${sampleContacts.length} contacts`);

        // Seed initial Log
        console.log('📝 Seeding initial log...');
        await addDoc(collection(db, COLLECTION_NAMES.LOGS), {
            action: 'CREATE_MEMBER',
            by: 'system',
            data: { message: 'Database seeded successfully' },
            createdAt: now,
        });
        console.log('✅ Đã thêm initial log');

        console.log('🎉 Seed database thành công!');
        return true;

    } catch (error) {
        console.error('❌ Seed database thất bại:', error);
        return false;
    }
};

/**
 * Seed only specific collection
 */
export const seedCollection = async (
    collectionName: keyof typeof COLLECTION_NAMES
): Promise<boolean> => {
    try {
        const now = Timestamp.now();

        switch (collectionName) {
            case 'MEMBERS':
                for (const member of sampleMembers) {
                    await addDoc(collection(db, COLLECTION_NAMES.MEMBERS), {
                        ...member,
                        createdAt: now,
                        updatedAt: now,
                    });
                }
                break;
            case 'SCHEDULES':
                for (const schedule of sampleSchedules) {
                    await addDoc(collection(db, COLLECTION_NAMES.SCHEDULES), {
                        ...schedule,
                        createdAt: now,
                    });
                }
                break;
            case 'PRODUCTS':
                for (const product of sampleProducts) {
                    await addDoc(collection(db, COLLECTION_NAMES.PRODUCTS), {
                        ...product,
                        createdAt: now,
                    });
                }
                break;
            case 'CONTACTS':
                for (const contact of sampleContacts) {
                    await addDoc(collection(db, COLLECTION_NAMES.CONTACTS), {
                        ...contact,
                        createdAt: now,
                    });
                }
                break;
            default:
                console.warn(`No seed data for ${collectionName}`);
                return false;
        }

        console.log(`✅ Seeded ${collectionName} successfully`);
        return true;

    } catch (error) {
        console.error(`❌ Seed ${collectionName} failed:`, error);
        return false;
    }
};
