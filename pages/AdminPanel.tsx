import React, { useState, useEffect } from 'react';
import { authAPI, membersAPI, coachesAPI, paymentsAPI, contactAPI, scheduleAPI, logsAPI, shopAdminAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AdminUser {
    id: string;
    username: string;
    full_name: string;
    role: string;
}

const AdminPanel: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<AdminUser | null>(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);

    // Login form logic
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    // Data states
    const [stats, setStats] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [coaches, setCoaches] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [schedule, setSchedule] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);

    // Coach Management State
    const [showAddCoachModal, setShowAddCoachModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedCoachForModal, setSelectedCoachForModal] = useState<any>(null);
    const [newCoachData, setNewCoachData] = useState({
        full_name: '',
        phone: '',
        hourly_rate: 250000,
        avatar_url: '',
        experience_years: 0,
        badges: '' // comma separated
    });

    const handleAddCoachSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const badgesArray = newCoachData.badges.split(',').map(s => s.trim()).filter(s => s);
            await coachesAPI.create({
                ...newCoachData,
                badges: badgesArray
            });
            setShowAddCoachModal(false);
            setNewCoachData({ full_name: '', phone: '', hourly_rate: 250000, avatar_url: '', experience_years: 0, badges: '' });
            alert('Thêm HLV thành công!');
            loadDashboardData(); // Reload list
        } catch (error) {
            alert('Lỗi khi thêm HLV');
        }
    };

    const handleViewSchedule = (coach: any) => {
        setSelectedCoachForModal(coach);
        setShowScheduleModal(true);
    };

    const handleViewHistory = (coach: any) => {
        setSelectedCoachForModal(coach);
        setShowHistoryModal(true);
    };

    // Settings
    const FIELD_FEE_PER_SESSION = 50000; // 50k phí sân/buổi

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        if (authAPI.isLoggedIn()) {
            const savedUser = authAPI.getUser();
            setUser(savedUser);
            setIsLoggedIn(true);
            loadDashboardData();
        }
        setLoading(false);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        try {
            const result = await authAPI.login(username, password);
            setUser(result.data.admin);
            setIsLoggedIn(true);
            loadDashboardData();
        } catch (err: any) {
            setLoginError(err.message || 'Đăng nhập thất bại');
        }
    };

    const handleLogout = () => {
        authAPI.logout();
        setIsLoggedIn(false);
        setUser(null);
    };

    const handleUpdateOrderStatus = async (id: string, status: string) => {
        try {
            await shopAdminAPI.updateOrderStatus(id, status);
            loadDashboardData(); // Reload data
        } catch (error) {
            console.error('Failed to update order status:', error);
            alert('Không thể cập nhật trạng thái đơn hàng');
        }
    };

    const loadDashboardData = async () => {
        try {
            const [membersRes, paymentsRes, coachesRes, contactsRes, scheduleRes, ordersRes, logsRes] = await Promise.all([
                membersAPI.getAll(),
                paymentsAPI.getAll(),
                coachesAPI.getAll(),
                contactAPI.getAll().catch(() => ({ data: [] })),
                scheduleAPI.getWeekly(),
                shopAdminAPI.getOrders().catch(() => ({ data: [] })),
                logsAPI.getRecent().catch(() => ({ data: [] }))
            ]);

            setMembers(membersRes.data || []);
            setPayments(paymentsRes.data || []);
            setCoaches(coachesRes.data || []);
            setContacts(contactsRes.data || []);
            setSchedule(scheduleRes.data || []);
            setOrders(ordersRes.data || []);
            setLogs(logsRes.data || []);

            // Calculate basic stats
            setStats({
                totalMembers: membersRes.data?.length || 0,
                activeMembers: membersRes.data?.filter((m: any) => m.status === 'active').length || 0,
                totalCoaches: coachesRes.data?.length || 0,
                totalRevenue: paymentsRes.data?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0,
                newContacts: contactsRes.data?.filter((c: any) => c.status === 'new').length || 0,
                newOrders: ordersRes.data?.filter((o: any) => o.status === 'new').length || 0
            });
        } catch (err) {
            console.error('Error loading data:', err);
        }
    };

    const getBadgeStyle = (label: string) => {
        const lowerLabel = label.toLowerCase();
        if (lowerLabel.includes('kiện tướng') || lowerLabel.includes('chuyên nghiệp'))
            return { bg: 'rgba(239, 68, 68, 0.2)', col: '#fca5a5', bdr: '1px solid rgba(239, 68, 68, 0.3)' }; // Red
        if (lowerLabel.includes('tận tâm') || lowerLabel.includes('nhiệt tình'))
            return { bg: 'rgba(34, 197, 94, 0.2)', col: '#86efac', bdr: '1px solid rgba(34, 197, 94, 0.3)' }; // Green
        if (lowerLabel.includes('chứng chỉ') || lowerLabel.includes('bằng cấp'))
            return { bg: 'rgba(59, 130, 246, 0.2)', col: '#93c5fd', bdr: '1px solid rgba(59, 130, 246, 0.3)' }; // Blue
        return { bg: 'rgba(255, 255, 255, 0.1)', col: '#e5e7eb', bdr: '1px solid rgba(255, 255, 255, 0.1)' }; // Default Gray
    };

    if (loading) return <div className="admin-loading"><div className="spinner"></div><p>Đang tải...</p></div>;

    if (!isLoggedIn) {
        return (
            <div className="admin-login-page">
                <div className="admin-login-card">
                    <div className="login-header">
                        <img src="/images/logo.png" alt="Logo" className="login-logo" />
                        <h1>ADMIN PANEL</h1>
                        <p>CLB Bóng Bàn Lê Quý Đôn</p>
                    </div>
                    <form onSubmit={handleLogin} className="login-form">
                        {loginError && <div className="login-error"><i className="fas fa-exclamation-circle"></i>{loginError}</div>}
                        <div className="form-group">
                            <label><i className="fas fa-user"></i> Tên đăng nhập</label>
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Nhập username" required />
                        </div>
                        <div className="form-group">
                            <label><i className="fas fa-lock"></i> Mật khẩu</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu" required />
                        </div>
                        <button type="submit" className="btn-login"><i className="fas fa-sign-in-alt"></i> ĐĂNG NHẬP</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-panel">
            {/* NEW MENU STRUCTURE */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <img src="/images/logo.png" alt="Logo" />
                    <span>ADMIN</span>
                </div>

                <nav className="sidebar-nav">
                    <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
                        <i className="fas fa-tachometer-alt"></i> Dashboard
                    </button>

                    {/* Updated Menu Items */}
                    <button className={activeTab === 'coaches' ? 'active' : ''} onClick={() => setActiveTab('coaches')}>
                        <i className="fas fa-chalkboard-teacher"></i> Quản lý HLV
                    </button>


                    <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
                        <i className="fas fa-shopping-bag"></i> Đơn hàng Shop
                        {stats?.newOrders > 0 && <span className="badge" style={{ background: '#e11d48', color: '#fff', marginLeft: 'auto' }}>{stats.newOrders}</span>}
                    </button>

                    <div className="sidebar-divider" style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1rem 1.5rem' }}></div>

                    <button className={activeTab === 'contacts' ? 'active' : ''} onClick={() => setActiveTab('contacts')}>
                        <i className="fas fa-envelope"></i> Liên hệ
                        {stats?.newContacts > 0 && <span className="badge">{stats.newContacts}</span>}
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <i className="fas fa-user-circle"></i>
                        <span>{user?.full_name || user?.username}</span>
                    </div>
                    <button className="btn-logout" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i></button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <h1>
                        {activeTab === 'dashboard' && 'Tổng quan CLB'}
                        {activeTab === 'coaches' && 'Đội ngũ Huấn luyện viên'}
                        {activeTab === 'orders' && 'Quản lý Đơn hàng Shop'}
                        {activeTab === 'contacts' && `Hộp thư Liên hệ (${contacts.length})`}
                    </h1>
                    <div className="header-actions">
                        <span className="current-time">
                            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                </header>

                <div className="admin-content">
                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && (
                        <div className="dashboard-grid" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Stats Cards Row */}

                            {/* Revenue Chart Section */}
                            <div className="chart-section" style={{
                                background: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '16px',
                                padding: '1.5rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                            }}>
                                <h3 style={{ color: '#111827', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 700 }}>
                                    <i className="fas fa-chart-bar" style={{ color: '#4f46e5', marginRight: '0.5rem' }}></i>
                                    Biểu đồ Doanh thu (6 tháng gần nhất)
                                </h3>
                                <div style={{ width: '100%', height: 350 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={[
                                            { name: 'T7', revenue: 0 },
                                            { name: 'T8', revenue: 0 },
                                            { name: 'T9', revenue: 0 },
                                            { name: 'T10', revenue: 0 },
                                            { name: 'T11', revenue: 0 },
                                            { name: 'T12', revenue: 0 },
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                            <XAxis dataKey="name" stroke="#6b7280" axisLine={false} tickLine={false} />
                                            <YAxis stroke="#6b7280" domain={[0, 10000000]} tickFormatter={(value) => value === 0 ? '0' : `${value / 1000000}M`} axisLine={false} tickLine={false} />
                                            <Tooltip
                                                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', color: '#1f2937', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                                formatter={(value: number) => [`${value.toLocaleString('vi-VN')}₫`, 'Doanh thu']}
                                                itemStyle={{ color: '#1f2937' }}
                                            />
                                            <Legend wrapperStyle={{ color: '#4b5563' }} />
                                            <Bar dataKey="revenue" name="Doanh thu" fill="#e11d48" radius={[4, 4, 0, 0]} barSize={50} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Recent Activity Section */}
                            <div className="dashboard-section" style={{ gridColumn: 'span 2', marginTop: '1.5rem' }}>
                                <div className="section-header" style={{ marginBottom: '1rem' }}>
                                    <h3 style={{ color: '#111827', margin: 0 }}><i className="fas fa-history" style={{ color: '#e11d48', marginRight: '0.5rem' }}></i> Lịch sử hoạt động gần đây</h3>
                                </div>
                                <div className="activity-list">
                                    {logs.length > 0 ? (
                                        logs.map((log: any) => (
                                            <div key={log.id} style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f3f4f6' }}>
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '50%',
                                                    background: log.action_type.includes('ORDER') ? '#fee2e2' : '#e0f2fe',
                                                    color: log.action_type.includes('ORDER') ? '#e11d48' : '#0284c7',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem',
                                                    flexShrink: 0
                                                }}>
                                                    <i className={`fas ${log.action_type.includes('ORDER') ? 'fa-shopping-bag' : 'fa-bell'}`}></i>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ color: '#1f2937', fontWeight: 500 }}>{log.description}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{new Date(log.created_at).toLocaleString('vi-VN')}</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                                            Chưa có hoạt động nào được ghi nhận
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* COACHES TAB - UPDATED UI */}
                    {activeTab === 'coaches' && (
                        <div className="coaches-section">
                            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h3 style={{ color: '#111827', margin: 0 }}>Danh sách HLV ({coaches.length})</h3>
                                <button onClick={() => setShowAddCoachModal(true)} className="btn-action" style={{ background: 'crimson', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600 }}>
                                    <i className="fas fa-plus"></i> Thêm HLV mới
                                </button>
                            </div>

                            <div className="coaches-grid">
                                {coaches.map((coach: any) => (
                                    <div key={coach.id} className="coach-card-admin">
                                        <div className="coach-avatar">
                                            {coach.avatar_url ? (
                                                <img src={coach.avatar_url} alt="" />
                                            ) : (
                                                <i className="fas fa-user-tie"></i>
                                            )}
                                        </div>

                                        <div className="coach-info">
                                            <h4>{coach.full_name}</h4>

                                            {/* Phone Warning Logic */}
                                            {!coach.phone ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.85rem', background: '#fee2e2', padding: '0.2rem 0.5rem', borderRadius: '4px', width: 'fit-content', marginBottom: '0.5rem' }}>
                                                    <i className="fas fa-exclamation-circle"></i> Thiếu SĐT liên hệ
                                                </div>
                                            ) : (
                                                <div className="coach-phone">
                                                    <i className="fas fa-phone-alt" style={{ fontSize: '0.8rem', marginRight: '0.5rem' }}></i>
                                                    {coach.phone}
                                                </div>
                                            )}

                                            <div className="coach-fee">
                                                <strong>{Number(coach.hourly_rate).toLocaleString('vi-VN')}₫</strong> <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 400 }}>/ giờ</span>
                                            </div>


                                            {/* Tags with Dynamic Colors */}
                                            <div className="coach-badges">
                                                {coach.badges?.map((badge: string, i: number) => {
                                                    const style = getBadgeStyle(badge);
                                                    return (
                                                        <span key={i} className="coach-badge" style={{
                                                            background: style.bg,
                                                            color: style.col,
                                                            border: style.bdr,
                                                        }}>
                                                            {badge}
                                                        </span>
                                                    );
                                                })}
                                            </div>

                                            {/* Action Buttons */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
                                                <button
                                                    onClick={() => handleViewSchedule(coach)}
                                                    disabled={!coach.phone}
                                                    style={{
                                                        background: '#f3f4f6', border: '1px solid #e5e7eb',
                                                        color: '#374151', padding: '0.5rem', borderRadius: '8px', cursor: !coach.phone ? 'not-allowed' : 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                                        fontSize: '0.85rem', transition: 'all 0.2s', fontWeight: 500,
                                                        opacity: !coach.phone ? 0.5 : 1
                                                    }} className={!coach.phone ? '' : "hover-btn"}>
                                                    <i className="fas fa-calendar-alt" style={{ color: '#e11d48' }}></i> Xem lịch dạy
                                                </button>
                                                <button
                                                    onClick={() => handleViewHistory(coach)}
                                                    disabled={!coach.phone}
                                                    style={{
                                                        background: '#f3f4f6', border: '1px solid #e5e7eb',
                                                        color: '#374151', padding: '0.5rem', borderRadius: '8px', cursor: !coach.phone ? 'not-allowed' : 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                                        fontSize: '0.85rem', fontWeight: 500,
                                                        opacity: !coach.phone ? 0.5 : 1
                                                    }} className={!coach.phone ? '' : "hover-btn"}>
                                                    <i className="fas fa-history" style={{ color: '#059669' }}></i> Lịch sử dạy
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* NEW: RECONCILIATION TAB (ĐỐI SOÁT) */}
                    {activeTab === 'reconciliation' && (
                        <div className="reconciliation-section">
                            <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <i className="fas fa-info-circle" style={{ fontSize: '1.5rem', color: '#d97706' }}></i>
                                <div>
                                    <h4 style={{ color: '#92400e', margin: 0, marginBottom: '0.25rem', fontWeight: 700 }}>Quy tắc thu phí sân</h4>
                                    <p style={{ margin: 0, color: '#b45309', fontSize: '0.9rem' }}>
                                        Mỗi ca dạy (session) HLV phải nộp lại CLB <strong>{FIELD_FEE_PER_SESSION.toLocaleString('vi-VN')}₫</strong> (Tiền điện, nước, bàn).
                                    </p>
                                </div>
                            </div>

                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Huấn luyện viên</th>
                                        <th style={{ textAlign: 'center' }}>Tổng ca dạy (Tháng)</th>
                                        <th style={{ textAlign: 'center' }}>Học viên phụ trách</th>
                                        <th>Phí sân phải nộp</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coaches.map((coach: any) => {
                                        // Mock calculation data (Replace with real backend data later)
                                        const totalSessions = 0;
                                        const studentsCount = 0;
                                        const totalDue = 0;
                                        const isPaid = true;

                                        return (
                                            <tr key={coach.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e5e7eb', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {coach.avatar_url ? <img src={coach.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <i className="fas fa-user" style={{ color: '#9ca3af' }}></i>}
                                                        </div>
                                                        <strong>{coach.full_name}</strong>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>{totalSessions}</td>
                                                <td style={{ textAlign: 'center' }}>{studentsCount}</td>
                                                <td className="amount" style={{ color: '#ef4444' }}>
                                                    {totalDue.toLocaleString('vi-VN')}₫
                                                </td>
                                                <td>
                                                    <span className={`badge`} style={{
                                                        background: isPaid ? '#dcfce7' : '#fee2e2',
                                                        color: isPaid ? '#166534' : '#991b1b'
                                                    }}>
                                                        {isPaid ? 'Đã nộp đủ' : 'Chưa nộp'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {!isPaid && (
                                                        <button style={{
                                                            background: '#e11d48', color: 'white', border: 'none',
                                                            padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600
                                                        }}>
                                                            Thu tiền
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}



                    {/* ORDERS TAB */}
                    {activeTab === 'orders' && (
                        <div className="orders-section">
                            <div className="section-header">
                                <h3 style={{ color: '#111827' }}>Quản lý Đơn hàng Shop ({orders.length})</h3>
                            </div>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Mã đơn</th>
                                        <th>Khách hàng</th>
                                        <th>Tổng tiền</th>
                                        <th>Thanh toán</th>
                                        <th>Trạng thái</th>
                                        <th>Ngày đặt</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order: any) => (
                                        <tr key={order.id}>
                                            <td>
                                                <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#e11d48', fontWeight: 600 }}>
                                                    {order.order_code}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600, color: '#111827' }}>{order.customer_name}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                                    <i className="fas fa-phone-alt" style={{ fontSize: '0.75rem', marginRight: '0.25rem' }}></i>
                                                    {order.customer_phone}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600, color: '#e11d48' }}>
                                                    {Number(order.total_amount).toLocaleString('vi-VN')}₫
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                                    {order.item_count || 1} sản phẩm
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge`} style={{
                                                    background: order.payment_status === 'pending' ? '#fef3c7' :
                                                        order.payment_status === 'paid' ? '#dbeafe' :
                                                            order.payment_status === 'confirmed' ? '#dcfce7' : '#f3f4f6',
                                                    color: order.payment_status === 'pending' ? '#92400e' :
                                                        order.payment_status === 'paid' ? '#1d4ed8' :
                                                            order.payment_status === 'confirmed' ? '#166534' : '#374151'
                                                }}>
                                                    {order.payment_status === 'pending' && 'Chờ TT'}
                                                    {order.payment_status === 'paid' && 'Đã TT'}
                                                    {order.payment_status === 'confirmed' && 'Đã xác nhận'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge`} style={{
                                                    background: order.order_status === 'new' ? '#fee2e2' :
                                                        order.order_status === 'processing' ? '#fef3c7' :
                                                            order.order_status === 'done' ? '#dcfce7' : '#f3f4f6',
                                                    color: order.order_status === 'new' ? '#991b1b' :
                                                        order.order_status === 'processing' ? '#92400e' :
                                                            order.order_status === 'done' ? '#166534' : '#374151'
                                                }}>
                                                    {order.order_status === 'new' && 'Mới'}
                                                    {order.order_status === 'processing' && 'Đang xử lý'}
                                                    {order.order_status === 'done' && 'Hoàn tất'}
                                                    {order.order_status === 'cancelled' && 'Đã hủy'}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                                {new Date(order.created_at).toLocaleString('vi-VN')}
                                            </td>
                                            <td>
                                                {order.order_status !== 'done' && order.order_status !== 'cancelled' && (
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            onClick={() => handleUpdateOrderStatus(order.id, 'done')}
                                                            style={{
                                                                background: '#10b981', color: 'white', border: 'none',
                                                                padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem'
                                                            }}
                                                            title="Hoàn tất"
                                                        >
                                                            <i className="fas fa-check"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                                            style={{
                                                                background: '#ef4444', color: 'white', border: 'none',
                                                                padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem'
                                                            }}
                                                            title="Hủy đơn"
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    </div>
                                                )}
                                                <a href={`tel:${order.customer_phone}`} style={{
                                                    marginLeft: '0.5rem',
                                                    color: '#3b82f6',
                                                    fontSize: '1rem',
                                                    textDecoration: 'none'
                                                }} title="Gọi khách">
                                                    <i className="fas fa-phone"></i>
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr>
                                            <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                                                Chưa có đơn hàng nào
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* CONTACTS TAB - FIXED LIGHT THEME UI */}
                    {activeTab === 'contacts' && (
                        <div className="contacts-section">
                            <div className="contacts-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {contacts.map((contact: any) => (
                                    <div key={contact.id} className={`contact-card ${contact.status === 'new' ? 'contact-new' : ''}`}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <div>
                                                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#111827' }}>{contact.name}</h4>
                                                <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                                                    <i className="fas fa-phone-alt" style={{ marginRight: '0.5rem', fontSize: '0.8rem' }}></i>
                                                    {contact.phone}
                                                </span>
                                            </div>
                                            <span style={{
                                                background: contact.status === 'new' ? '#fee2e2' : '#dcfce7',
                                                color: contact.status === 'new' ? '#e11d48' : '#16a34a',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                height: 'fit-content'
                                            }}>
                                                {contact.status === 'new' ? 'Mới' : 'Đã xem'}
                                            </span>
                                        </div>

                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.25rem' }}>Chủ đề:</div>
                                            <div style={{ fontWeight: 600, color: '#374151' }}>{contact.subject}</div>
                                        </div>

                                        <div className="contact-message">
                                            {contact.message}
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                                                {new Date(contact.created_at).toLocaleString('vi-VN')}
                                            </span>
                                            <a href={`tel:${contact.phone}`} style={{
                                                background: '#f0fdf4',
                                                color: '#16a34a',
                                                border: '1px solid #bbf7d0',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '6px',
                                                textDecoration: 'none',
                                                fontSize: '0.9rem',
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <i className="fas fa-phone"></i> Gọi lại
                                            </a>
                                        </div>
                                    </div>
                                ))}
                                {contacts.length === 0 && (
                                    <div className="empty-state" style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                                        <i className="fas fa-inbox" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
                                        <p>Chưa có tin nhắn liên hệ</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ADD COACH MODAL */}
            {showAddCoachModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem', color: '#111827' }}>Thêm Huấn luyện viên mới</h3>
                        <form onSubmit={handleAddCoachSubmit}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Họ và tên</label>
                                <input
                                    type="text"
                                    required
                                    className="form-control"
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                    value={newCoachData.full_name}
                                    onChange={e => setNewCoachData({ ...newCoachData, full_name: e.target.value })}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Số điện thoại</label>
                                <input
                                    type="text"
                                    required
                                    className="form-control"
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                    value={newCoachData.phone}
                                    onChange={e => setNewCoachData({ ...newCoachData, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Học phí (VND/giờ)</label>
                                <input
                                    type="number"
                                    required
                                    className="form-control"
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                    value={newCoachData.hourly_rate}
                                    onChange={e => setNewCoachData({ ...newCoachData, hourly_rate: Number(e.target.value) })}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Link ảnh đại diện (URL)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                    value={newCoachData.avatar_url}
                                    onChange={e => setNewCoachData({ ...newCoachData, avatar_url: e.target.value })}
                                    placeholder="https://example.com/avatar.jpg"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Thẻ kỹ năng (phân cách bằng dấu phẩy)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                    value={newCoachData.badges}
                                    onChange={e => setNewCoachData({ ...newCoachData, badges: e.target.value })}
                                    placeholder="Ví dụ: Chuyên nghiệp, Tận tâm, Kiện tướng"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowAddCoachModal(false)} style={{ background: '#f3f4f6', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', color: '#374151' }}>Hủy bỏ</button>
                                <button type="submit" style={{ background: '#e11d48', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '6px', cursor: 'pointer', color: 'white', fontWeight: 600 }}>Thêm mới</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* SCHEDULE MODAL */}
            {showScheduleModal && selectedCoachForModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Lịch dạy: {selectedCoachForModal.full_name}</h3>
                            <button onClick={() => setShowScheduleModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>
                        {selectedCoachForModal.schedule && selectedCoachForModal.schedule.length > 0 ? (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Thứ</th>
                                        <th>Thời gian</th>
                                        <th>Loại hình</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedCoachForModal.schedule.map((slot: any) => (
                                        <tr key={slot.id}>
                                            <td>Thứ {slot.day_of_week}</td>
                                            <td>{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</td>
                                            <td>
                                                {slot.session_type === 'private' ? '1 kèm 1' : 'Nhóm'}
                                            </td>
                                            <td>
                                                <span className="badge" style={{ background: '#dcfce7', color: '#166534' }}>Hoạt động</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>Chưa có lịch dạy nào được đăng ký.</p>
                        )}
                    </div>
                </div>
            )}

            {/* HISTORY MODAL */}
            {showHistoryModal && selectedCoachForModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Lịch sử dạy: {selectedCoachForModal.full_name}</h3>
                            <button onClick={() => setShowHistoryModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <div style={{ textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
                            <i className="fas fa-history" style={{ fontSize: '2rem', color: '#9ca3af', marginBottom: '1rem' }}></i>
                            <p style={{ color: '#6b7280' }}>Tính năng đang được cập nhật dữ liệu từ máy chủ.</p>
                            <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Vui lòng quay lại sau.</p>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default AdminPanel;
