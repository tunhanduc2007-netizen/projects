/**
 * ============================================================
 * 🛠️ ADMIN PANEL - PRODUCTION
 * CLB Bóng Bàn Lê Quý Đôn
 * ============================================================
 * 
 * ⚠️ NO FAKE DATA - All data created by real admin actions only
 * 
 * Features:
 * - Firebase Auth (email/password)
 * - Role-based access (admin only)
 * - CRUD for: Schedules, Products
 * - Read-only: Contacts, Visits, Payments, Logs
 * - Real form validation
 * - No page reload
 * 
 * ============================================================
 */

import React, { useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
} from 'firebase/auth';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    Timestamp,
    getDoc,
    setDoc,
} from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { Schedule, Product, Contact, Visit, Payment, Log, COLLECTIONS } from '../../firebase/schema';

// ============================================================
// 🔧 TYPES
// ============================================================

type Tab = 'dashboard' | 'schedules' | 'products' | 'contacts' | 'visits' | 'payments' | 'logs';
type ModalType = 'create' | 'edit' | null;

interface AdminUser {
    uid: string;
    email: string;
    role: 'admin' | 'staff';
}

// ============================================================
// 🔐 AUTH COMPONENT
// ============================================================

const LoginForm: React.FC<{ onLogin: (email: string, password: string) => Promise<void>; error: string | null; loading: boolean }> = ({ onLogin, error, loading }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onLogin(email, password);
    };

    return (
        <div style={styles.loginContainer}>
            <div style={styles.loginCard}>
                <h1 style={styles.loginTitle}>🏓 Admin Panel</h1>
                <p style={styles.loginSubtitle}>CLB Bóng Bàn Lê Quý Đôn</p>

                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <button type="submit" style={styles.loginButton} disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ============================================================
// 📅 SCHEDULE FORM
// ============================================================

const ScheduleForm: React.FC<{
    schedule?: Schedule;
    onSave: (data: Partial<Schedule>) => Promise<void>;
    onCancel: () => void;
    loading: boolean;
}> = ({ schedule, onSave, onCancel, loading }) => {
    const [title, setTitle] = useState(schedule?.title || '');
    const [description, setDescription] = useState(schedule?.description || '');
    const [dayOfWeek, setDayOfWeek] = useState(schedule?.dayOfWeek ?? 1);
    const [startTime, setStartTime] = useState(schedule?.startTime || '17:00');
    const [endTime, setEndTime] = useState(schedule?.endTime || '19:00');
    const [coachName, setCoachName] = useState(schedule?.coachName || '');
    const [type, setType] = useState<Schedule['type']>(schedule?.type || 'class');
    const [level, setLevel] = useState<Schedule['level']>(schedule?.level || 'all');
    const [maxParticipants, setMaxParticipants] = useState(schedule?.maxParticipants || 10);
    const [price, setPrice] = useState(schedule?.price || 0);
    const [location, setLocation] = useState(schedule?.location || '');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!title || title.length < 3) {
            newErrors.title = 'Tiêu đề phải có ít nhất 3 ký tự';
        }
        if (price < 0) {
            newErrors.price = 'Giá phải >= 0';
        }
        if (maxParticipants < 1) {
            newErrors.maxParticipants = 'Số người tham gia phải >= 1';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        await onSave({
            title,
            description,
            dayOfWeek,
            startTime,
            endTime,
            coachName,
            type,
            level,
            maxParticipants,
            price,
            location,
            status: 'active',
        });
    };

    const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <h3>{schedule ? 'Sửa lịch tập' : 'Thêm lịch tập mới'}</h3>

            <div style={styles.formGroup}>
                <label>Tiêu đề *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={styles.input} required />
                {errors.title && <span style={styles.fieldError}>{errors.title}</span>}
            </div>

            <div style={styles.formGroup}>
                <label>Mô tả</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={styles.textarea} />
            </div>

            <div style={styles.formRow}>
                <div style={styles.formGroup}>
                    <label>Ngày trong tuần *</label>
                    <select value={dayOfWeek} onChange={(e) => setDayOfWeek(Number(e.target.value))} style={styles.select}>
                        {dayNames.map((name, i) => <option key={i} value={i}>{name}</option>)}
                    </select>
                </div>

                <div style={styles.formGroup}>
                    <label>Giờ bắt đầu *</label>
                    <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={styles.input} required />
                </div>

                <div style={styles.formGroup}>
                    <label>Giờ kết thúc *</label>
                    <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={styles.input} required />
                </div>
            </div>

            <div style={styles.formRow}>
                <div style={styles.formGroup}>
                    <label>Loại</label>
                    <select value={type} onChange={(e) => setType(e.target.value as Schedule['type'])} style={styles.select}>
                        <option value="class">Lớp học</option>
                        <option value="training">Tập luyện</option>
                        <option value="event">Sự kiện</option>
                    </select>
                </div>

                <div style={styles.formGroup}>
                    <label>Trình độ</label>
                    <select value={level} onChange={(e) => setLevel(e.target.value as Schedule['level'])} style={styles.select}>
                        <option value="all">Tất cả</option>
                        <option value="beginner">Người mới</option>
                        <option value="intermediate">Trung bình</option>
                        <option value="advanced">Nâng cao</option>
                    </select>
                </div>
            </div>

            <div style={styles.formRow}>
                <div style={styles.formGroup}>
                    <label>HLV phụ trách</label>
                    <input type="text" value={coachName} onChange={(e) => setCoachName(e.target.value)} style={styles.input} />
                </div>

                <div style={styles.formGroup}>
                    <label>Số người tối đa *</label>
                    <input type="number" value={maxParticipants} onChange={(e) => setMaxParticipants(Number(e.target.value))} style={styles.input} min="1" required />
                    {errors.maxParticipants && <span style={styles.fieldError}>{errors.maxParticipants}</span>}
                </div>
            </div>

            <div style={styles.formRow}>
                <div style={styles.formGroup}>
                    <label>Giá (VNĐ) *</label>
                    <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} style={styles.input} min="0" required />
                    {errors.price && <span style={styles.fieldError}>{errors.price}</span>}
                </div>

                <div style={styles.formGroup}>
                    <label>Địa điểm</label>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} style={styles.input} />
                </div>
            </div>

            <div style={styles.formActions}>
                <button type="button" onClick={onCancel} style={styles.cancelButton}>Hủy</button>
                <button type="submit" style={styles.saveButton} disabled={loading}>
                    {loading ? 'Đang lưu...' : 'Lưu'}
                </button>
            </div>
        </form>
    );
};

// ============================================================
// 🛒 PRODUCT FORM
// ============================================================

const ProductForm: React.FC<{
    product?: Product;
    onSave: (data: Partial<Product>) => Promise<void>;
    onCancel: () => void;
    loading: boolean;
}> = ({ product, onSave, onCancel, loading }) => {
    const [name, setName] = useState(product?.name || '');
    const [description, setDescription] = useState(product?.description || '');
    const [price, setPrice] = useState(product?.price || 0);
    const [originalPrice, setOriginalPrice] = useState(product?.originalPrice || 0);
    const [stock, setStock] = useState(product?.stock || 0);
    const [category, setCategory] = useState<Product['category']>(product?.category || 'other');
    const [brand, setBrand] = useState(product?.brand || '');
    const [sku, setSku] = useState(product?.sku || '');
    const [imageUrl, setImageUrl] = useState(product?.imageUrl || '');
    const [featured, setFeatured] = useState(product?.featured || false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!name || name.length < 2) {
            newErrors.name = 'Tên sản phẩm phải có ít nhất 2 ký tự';
        }
        if (price <= 0) {
            newErrors.price = 'Giá phải > 0';
        }
        if (stock < 0) {
            newErrors.stock = 'Số lượng phải >= 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        await onSave({
            name,
            description,
            price,
            originalPrice: originalPrice || undefined,
            stock,
            category,
            brand: brand || undefined,
            sku: sku || undefined,
            imageUrl: imageUrl || undefined,
            featured,
            status: 'active',
        });
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <h3>{product ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>

            <div style={styles.formGroup}>
                <label>Tên sản phẩm *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} required />
                {errors.name && <span style={styles.fieldError}>{errors.name}</span>}
            </div>

            <div style={styles.formGroup}>
                <label>Mô tả</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={styles.textarea} />
            </div>

            <div style={styles.formRow}>
                <div style={styles.formGroup}>
                    <label>Giá bán (VNĐ) *</label>
                    <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} style={styles.input} min="1" required />
                    {errors.price && <span style={styles.fieldError}>{errors.price}</span>}
                </div>

                <div style={styles.formGroup}>
                    <label>Giá gốc (VNĐ)</label>
                    <input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(Number(e.target.value))} style={styles.input} min="0" />
                </div>

                <div style={styles.formGroup}>
                    <label>Số lượng *</label>
                    <input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} style={styles.input} min="0" required />
                    {errors.stock && <span style={styles.fieldError}>{errors.stock}</span>}
                </div>
            </div>

            <div style={styles.formRow}>
                <div style={styles.formGroup}>
                    <label>Danh mục *</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value as Product['category'])} style={styles.select}>
                        <option value="racket">Vợt</option>
                        <option value="rubber">Mặt vợt</option>
                        <option value="ball">Bóng</option>
                        <option value="accessory">Phụ kiện</option>
                        <option value="clothing">Quần áo</option>
                        <option value="other">Khác</option>
                    </select>
                </div>

                <div style={styles.formGroup}>
                    <label>Thương hiệu</label>
                    <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} style={styles.input} />
                </div>

                <div style={styles.formGroup}>
                    <label>SKU</label>
                    <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} style={styles.input} />
                </div>
            </div>

            <div style={styles.formGroup}>
                <label>URL hình ảnh</label>
                <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} style={styles.input} />
            </div>

            <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                    <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                    Sản phẩm nổi bật
                </label>
            </div>

            <div style={styles.formActions}>
                <button type="button" onClick={onCancel} style={styles.cancelButton}>Hủy</button>
                <button type="submit" style={styles.saveButton} disabled={loading}>
                    {loading ? 'Đang lưu...' : 'Lưu'}
                </button>
            </div>
        </form>
    );
};

// ============================================================
// 📊 DATA TABLE
// ============================================================

interface Column<T> {
    key: keyof T | string;
    label: string;
    render?: (item: T) => React.ReactNode;
}

function DataTable<T extends { id: string }>({
    data,
    columns,
    onEdit,
    onDelete,
    canEdit = true,
    canDelete = true,
    loading,
}: {
    data: T[];
    columns: Column<T>[];
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    canEdit?: boolean;
    canDelete?: boolean;
    loading: boolean;
}) {
    if (loading) {
        return <div style={styles.loading}>Đang tải...</div>;
    }

    if (data.length === 0) {
        return <div style={styles.empty}>Chưa có dữ liệu</div>;
    }

    return (
        <div style={styles.tableContainer}>
            <table style={styles.table}>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={String(col.key)} style={styles.th}>{col.label}</th>
                        ))}
                        {(canEdit || canDelete) && <th style={styles.th}>Hành động</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id}>
                            {columns.map((col) => (
                                <td key={String(col.key)} style={styles.td}>
                                    {col.render ? col.render(item) : String((item as any)[col.key] ?? '')}
                                </td>
                            ))}
                            {(canEdit || canDelete) && (
                                <td style={styles.td}>
                                    {canEdit && onEdit && (
                                        <button onClick={() => onEdit(item)} style={styles.editButton}>Sửa</button>
                                    )}
                                    {canDelete && onDelete && (
                                        <button onClick={() => onDelete(item)} style={styles.deleteButton}>Xóa</button>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ============================================================
// 🏠 MAIN ADMIN PANEL
// ============================================================

const AdminPanel: React.FC = () => {
    // Auth state
    const [user, setUser] = useState<User | null>(null);
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    // UI state
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [modalType, setModalType] = useState<ModalType>(null);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Data state
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [visits, setVisits] = useState<Visit[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [logs, setLogs] = useState<Log[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    // ============================================
    // AUTH EFFECTS
    // ============================================

    useEffect(() => {
        if (!auth) {
            setAuthLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser && db) {
                // Check if user is admin
                try {
                    const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
                    if (adminDoc.exists()) {
                        const data = adminDoc.data();
                        if (data.role === 'admin' || data.role === 'staff') {
                            setAdminUser({
                                uid: firebaseUser.uid,
                                email: firebaseUser.email || '',
                                role: data.role,
                            });
                        } else {
                            setAuthError('Bạn không có quyền truy cập Admin Panel');
                            await signOut(auth);
                        }
                    } else {
                        setAuthError('Tài khoản không có quyền admin');
                        await signOut(auth);
                    }
                } catch (error) {
                    console.error('Error checking admin status:', error);
                    setAuthError('Lỗi kiểm tra quyền truy cập');
                }
            } else {
                setAdminUser(null);
            }

            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // ============================================
    // DATA SUBSCRIPTIONS
    // ============================================

    useEffect(() => {
        if (!db || !adminUser) return;

        const unsubscribes: (() => void)[] = [];

        // Schedules
        const schedulesQuery = query(collection(db, COLLECTIONS.SCHEDULES), orderBy('dayOfWeek'));
        unsubscribes.push(onSnapshot(schedulesQuery, (snapshot) => {
            setSchedules(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Schedule)));
        }));

        // Products
        const productsQuery = query(collection(db, COLLECTIONS.PRODUCTS), orderBy('name'));
        unsubscribes.push(onSnapshot(productsQuery, (snapshot) => {
            setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
        }));

        // Contacts
        const contactsQuery = query(collection(db, COLLECTIONS.CONTACTS), orderBy('createdAt', 'desc'));
        unsubscribes.push(onSnapshot(contactsQuery, (snapshot) => {
            setContacts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Contact)));
        }));

        // Visits
        const visitsQuery = query(collection(db, COLLECTIONS.VISITS), orderBy('date', 'desc'));
        unsubscribes.push(onSnapshot(visitsQuery, (snapshot) => {
            setVisits(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Visit)));
        }));

        // Payments
        const paymentsQuery = query(collection(db, COLLECTIONS.PAYMENTS), orderBy('createdAt', 'desc'));
        unsubscribes.push(onSnapshot(paymentsQuery, (snapshot) => {
            setPayments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Payment)));
        }));

        // Logs
        if (adminUser.role === 'admin') {
            const logsQuery = query(collection(db, COLLECTIONS.LOGS), orderBy('createdAt', 'desc'));
            unsubscribes.push(onSnapshot(logsQuery, (snapshot) => {
                setLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Log)));
            }));
        }

        setDataLoading(false);

        return () => unsubscribes.forEach(unsub => unsub());
    }, [adminUser]);

    // ============================================
    // AUTH HANDLERS
    // ============================================

    const handleLogin = async (email: string, password: string) => {
        if (!auth) {
            setAuthError('Firebase Auth không khả dụng');
            return;
        }

        setAuthLoading(true);
        setAuthError(null);

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            setAuthError(error.message || 'Đăng nhập thất bại');
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = async () => {
        if (auth) {
            await signOut(auth);
        }
    };

    // ============================================
    // CRUD HANDLERS
    // ============================================

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const writeLog = async (action: string, collectionName: string, documentId?: string, oldData?: any, newData?: any) => {
        if (!db || !adminUser) return;

        try {
            await addDoc(collection(db, COLLECTIONS.LOGS), {
                action,
                collection: collectionName,
                documentId,
                userId: adminUser.uid,
                userEmail: adminUser.email,
                oldData,
                newData,
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error writing log:', error);
        }
    };

    // Schedule CRUD
    const handleSaveSchedule = async (data: Partial<Schedule>) => {
        if (!db || !adminUser) return;
        setActionLoading(true);

        try {
            if (selectedItem) {
                // Update
                await updateDoc(doc(db, COLLECTIONS.SCHEDULES, selectedItem.id), {
                    ...data,
                    updatedAt: serverTimestamp(),
                });
                await writeLog('update', COLLECTIONS.SCHEDULES, selectedItem.id, selectedItem, data);
                showMessage('success', 'Đã cập nhật lịch tập');
            } else {
                // Create
                const docRef = await addDoc(collection(db, COLLECTIONS.SCHEDULES), {
                    ...data,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    createdBy: adminUser.uid,
                });
                await writeLog('create', COLLECTIONS.SCHEDULES, docRef.id, null, data);
                showMessage('success', 'Đã thêm lịch tập mới');
            }
            setModalType(null);
            setSelectedItem(null);
        } catch (error: any) {
            showMessage('error', error.message || 'Lỗi khi lưu');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteSchedule = async (schedule: Schedule) => {
        if (!db || !confirm('Bạn có chắc muốn xóa lịch tập này?')) return;

        try {
            await deleteDoc(doc(db, COLLECTIONS.SCHEDULES, schedule.id));
            await writeLog('delete', COLLECTIONS.SCHEDULES, schedule.id, schedule, null);
            showMessage('success', 'Đã xóa lịch tập');
        } catch (error: any) {
            showMessage('error', error.message || 'Lỗi khi xóa');
        }
    };

    // Product CRUD
    const handleSaveProduct = async (data: Partial<Product>) => {
        if (!db || !adminUser) return;
        setActionLoading(true);

        try {
            if (selectedItem) {
                await updateDoc(doc(db, COLLECTIONS.PRODUCTS, selectedItem.id), {
                    ...data,
                    updatedAt: serverTimestamp(),
                });
                await writeLog('update', COLLECTIONS.PRODUCTS, selectedItem.id, selectedItem, data);
                showMessage('success', 'Đã cập nhật sản phẩm');
            } else {
                const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
                    ...data,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    createdBy: adminUser.uid,
                });
                await writeLog('create', COLLECTIONS.PRODUCTS, docRef.id, null, data);
                showMessage('success', 'Đã thêm sản phẩm mới');
            }
            setModalType(null);
            setSelectedItem(null);
        } catch (error: any) {
            showMessage('error', error.message || 'Lỗi khi lưu');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteProduct = async (product: Product) => {
        if (!db || !confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

        try {
            await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, product.id));
            await writeLog('delete', COLLECTIONS.PRODUCTS, product.id, product, null);
            showMessage('success', 'Đã xóa sản phẩm');
        } catch (error: any) {
            showMessage('error', error.message || 'Lỗi khi xóa');
        }
    };

    // ============================================
    // RENDER
    // ============================================

    // Loading
    if (authLoading) {
        return <div style={styles.fullLoading}>Đang tải...</div>;
    }

    // Not logged in
    if (!user || !adminUser) {
        return <LoginForm onLogin={handleLogin} error={authError} loading={authLoading} />;
    }

    // Column definitions
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    const scheduleColumns: Column<Schedule>[] = [
        { key: 'dayOfWeek', label: 'Ngày', render: (s) => dayNames[s.dayOfWeek] },
        { key: 'title', label: 'Tiêu đề' },
        { key: 'startTime', label: 'Giờ', render: (s) => `${s.startTime} - ${s.endTime}` },
        { key: 'coachName', label: 'HLV' },
        { key: 'price', label: 'Giá', render: (s) => s.price.toLocaleString() + 'đ' },
        { key: 'status', label: 'Trạng thái' },
    ];

    const productColumns: Column<Product>[] = [
        { key: 'name', label: 'Tên' },
        { key: 'category', label: 'Danh mục' },
        { key: 'price', label: 'Giá', render: (p) => p.price.toLocaleString() + 'đ' },
        { key: 'stock', label: 'Tồn kho' },
        { key: 'featured', label: 'Nổi bật', render: (p) => p.featured ? '⭐' : '' },
    ];

    const contactColumns: Column<Contact>[] = [
        { key: 'name', label: 'Tên' },
        { key: 'phone', label: 'SĐT' },
        { key: 'message', label: 'Tin nhắn', render: (c) => c.message.substring(0, 50) + '...' },
        { key: 'status', label: 'Trạng thái' },
    ];

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                    <h2 style={styles.logo}>🏓 Admin</h2>
                    <p style={styles.userEmail}>{adminUser.email}</p>
                </div>

                <nav style={styles.nav}>
                    {[
                        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
                        { id: 'schedules', icon: '📅', label: 'Lịch tập' },
                        { id: 'products', icon: '🛒', label: 'Sản phẩm' },
                        { id: 'contacts', icon: '📧', label: 'Liên hệ' },
                        { id: 'visits', icon: '🏓', label: 'Lượt đến' },
                        { id: 'payments', icon: '💰', label: 'Thanh toán' },
                        ...(adminUser.role === 'admin' ? [{ id: 'logs', icon: '📋', label: 'Logs' }] : []),
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as Tab)}
                            style={{
                                ...styles.navItem,
                                ...(activeTab === item.id ? styles.navItemActive : {}),
                            }}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <button onClick={handleLogout} style={styles.logoutButton}>
                    🚪 Đăng xuất
                </button>
            </div>

            {/* Main content */}
            <div style={styles.main}>
                {/* Message */}
                {message && (
                    <div style={{
                        ...styles.message,
                        backgroundColor: message.type === 'success' ? '#22c55e' : '#ef4444',
                    }}>
                        {message.text}
                    </div>
                )}

                {/* Dashboard */}
                {activeTab === 'dashboard' && (
                    <div>
                        <h1 style={styles.pageTitle}>📊 Dashboard</h1>
                        <div style={styles.statsGrid}>
                            <div style={styles.statCard}>
                                <span style={styles.statIcon}>📅</span>
                                <span style={styles.statValue}>{schedules.length}</span>
                                <span style={styles.statLabel}>Lịch tập</span>
                            </div>
                            <div style={styles.statCard}>
                                <span style={styles.statIcon}>🛒</span>
                                <span style={styles.statValue}>{products.length}</span>
                                <span style={styles.statLabel}>Sản phẩm</span>
                            </div>
                            <div style={styles.statCard}>
                                <span style={styles.statIcon}>📧</span>
                                <span style={styles.statValue}>{contacts.filter(c => c.status === 'new').length}</span>
                                <span style={styles.statLabel}>Liên hệ mới</span>
                            </div>
                            <div style={styles.statCard}>
                                <span style={styles.statIcon}>🏓</span>
                                <span style={styles.statValue}>{visits.length}</span>
                                <span style={styles.statLabel}>Lượt đến</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Schedules */}
                {activeTab === 'schedules' && (
                    <div>
                        <div style={styles.pageHeader}>
                            <h1 style={styles.pageTitle}>📅 Lịch tập</h1>
                            <button
                                onClick={() => { setSelectedItem(null); setModalType('create'); }}
                                style={styles.addButton}
                            >
                                + Thêm lịch tập
                            </button>
                        </div>
                        <DataTable
                            data={schedules}
                            columns={scheduleColumns}
                            onEdit={(s) => { setSelectedItem(s); setModalType('edit'); }}
                            onDelete={handleDeleteSchedule}
                            loading={dataLoading}
                        />
                    </div>
                )}

                {/* Products */}
                {activeTab === 'products' && (
                    <div>
                        <div style={styles.pageHeader}>
                            <h1 style={styles.pageTitle}>🛒 Sản phẩm</h1>
                            <button
                                onClick={() => { setSelectedItem(null); setModalType('create'); }}
                                style={styles.addButton}
                            >
                                + Thêm sản phẩm
                            </button>
                        </div>
                        <DataTable
                            data={products}
                            columns={productColumns}
                            onEdit={(p) => { setSelectedItem(p); setModalType('edit'); }}
                            onDelete={handleDeleteProduct}
                            loading={dataLoading}
                        />
                    </div>
                )}

                {/* Contacts (read-only) */}
                {activeTab === 'contacts' && (
                    <div>
                        <h1 style={styles.pageTitle}>📧 Liên hệ</h1>
                        <DataTable
                            data={contacts}
                            columns={contactColumns}
                            canEdit={false}
                            canDelete={false}
                            loading={dataLoading}
                        />
                    </div>
                )}

                {/* Visits (read-only for now) */}
                {activeTab === 'visits' && (
                    <div>
                        <h1 style={styles.pageTitle}>🏓 Lượt đến CLB</h1>
                        <p style={styles.emptyNote}>Hiển thị khi có dữ liệu thực từ việc ghi nhận khách đến chơi.</p>
                    </div>
                )}

                {/* Payments (read-only) */}
                {activeTab === 'payments' && (
                    <div>
                        <h1 style={styles.pageTitle}>💰 Thanh toán</h1>
                        <p style={styles.emptyNote}>Hiển thị khi có dữ liệu thanh toán thực.</p>
                    </div>
                )}

                {/* Logs (admin only, read-only) */}
                {activeTab === 'logs' && adminUser.role === 'admin' && (
                    <div>
                        <h1 style={styles.pageTitle}>📋 System Logs</h1>
                        {logs.length === 0 ? (
                            <p style={styles.emptyNote}>Chưa có logs. Logs sẽ được tạo tự động khi có thao tác.</p>
                        ) : (
                            <div style={styles.logsList}>
                                {logs.map(log => (
                                    <div key={log.id} style={styles.logItem}>
                                        <span style={styles.logAction}>{log.action}</span>
                                        <span>{log.collection}/{log.documentId}</span>
                                        <span style={styles.logUser}>{log.userEmail}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {modalType && (
                <div style={styles.modalOverlay} onClick={() => setModalType(null)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        {activeTab === 'schedules' && (
                            <ScheduleForm
                                schedule={selectedItem}
                                onSave={handleSaveSchedule}
                                onCancel={() => setModalType(null)}
                                loading={actionLoading}
                            />
                        )}
                        {activeTab === 'products' && (
                            <ProductForm
                                product={selectedItem}
                                onSave={handleSaveProduct}
                                onCancel={() => setModalType(null)}
                                loading={actionLoading}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================
// 🎨 STYLES
// ============================================================

const styles: Record<string, React.CSSProperties> = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a' },
    sidebar: { width: '250px', backgroundColor: '#1e293b', padding: '20px', display: 'flex', flexDirection: 'column' },
    sidebarHeader: { marginBottom: '30px' },
    logo: { color: '#f8fafc', margin: 0 },
    userEmail: { color: '#94a3b8', fontSize: '12px', margin: '8px 0 0' },
    nav: { flex: 1 },
    navItem: { display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', border: 'none', backgroundColor: 'transparent', color: '#94a3b8', cursor: 'pointer', borderRadius: '8px', marginBottom: '4px', fontSize: '14px', textAlign: 'left' },
    navItemActive: { backgroundColor: '#334155', color: '#f8fafc' },
    logoutButton: { padding: '12px', border: 'none', backgroundColor: '#dc2626', color: 'white', borderRadius: '8px', cursor: 'pointer' },
    main: { flex: 1, padding: '30px', overflowY: 'auto' },
    pageTitle: { color: '#f8fafc', margin: '0 0 20px' },
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    addButton: { padding: '10px 20px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
    statCard: { backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    statIcon: { fontSize: '32px', marginBottom: '8px' },
    statValue: { fontSize: '36px', fontWeight: 700, color: '#f8fafc' },
    statLabel: { fontSize: '14px', color: '#94a3b8' },
    tableContainer: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#1e293b', borderRadius: '12px', overflow: 'hidden' },
    th: { padding: '16px', textAlign: 'left', backgroundColor: '#334155', color: '#f8fafc', fontWeight: 600 },
    td: { padding: '16px', borderTop: '1px solid #334155', color: '#e2e8f0' },
    editButton: { padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' },
    deleteButton: { padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    loading: { color: '#94a3b8', textAlign: 'center', padding: '40px' },
    empty: { color: '#64748b', textAlign: 'center', padding: '40px', backgroundColor: '#1e293b', borderRadius: '12px' },
    emptyNote: { color: '#64748b', fontStyle: 'italic' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' },
    form: { color: '#f8fafc' },
    formGroup: { marginBottom: '16px' },
    formRow: { display: 'flex', gap: '16px', marginBottom: '16px' },
    input: { width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '14px' },
    textarea: { width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '14px', minHeight: '80px', resize: 'vertical' },
    select: { width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '14px' },
    checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
    formActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' },
    cancelButton: { padding: '12px 24px', backgroundColor: '#475569', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    saveButton: { padding: '12px 24px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 },
    fieldError: { color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' },
    message: { position: 'fixed', top: '20px', right: '20px', padding: '16px 24px', borderRadius: '8px', color: 'white', zIndex: 1001, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' },
    error: { backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '16px' },
    fullLoading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a', color: '#f8fafc' },
    loginContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0f172a' },
    loginCard: { backgroundColor: '#1e293b', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '400px' },
    loginTitle: { color: '#f8fafc', textAlign: 'center', marginBottom: '8px' },
    loginSubtitle: { color: '#94a3b8', textAlign: 'center', marginBottom: '32px' },
    loginButton: { width: '100%', padding: '14px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '16px' },
    logsList: { display: 'flex', flexDirection: 'column', gap: '8px' },
    logItem: { backgroundColor: '#1e293b', padding: '12px 16px', borderRadius: '8px', display: 'flex', gap: '16px', color: '#94a3b8', fontSize: '13px' },
    logAction: { fontWeight: 600, color: '#f8fafc' },
    logUser: { color: '#64748b' },
};

export default AdminPanel;
