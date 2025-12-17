import React, { useState, useEffect } from 'react';
import { authAPI, membersAPI, coachesAPI, paymentsAPI, contactAPI, scheduleAPI, ordersAPI, logsAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles/admin-mobile.css';

interface AdminUser {
    id: string;
    username: string;
    full_name: string;
    role: string;
}

const AdminPanelMobile: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<AdminUser | null>(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(false);

    // Login form
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

    // Chart period
    const [chartPeriod, setChartPeriod] = useState<3 | 6 | 12>(3);

    // Bottom Sheet
    const [showSheet, setShowSheet] = useState(false);
    const [sheetContent, setSheetContent] = useState<React.ReactNode>(null);
    const [sheetTitle, setSheetTitle] = useState('');

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

    const loadDashboardData = async () => {
        setDataLoading(true);
        try {
            const [membersRes, paymentsRes, coachesRes, contactsRes, scheduleRes, ordersRes] = await Promise.all([
                membersAPI.getAll().catch(() => ({ data: [] })),
                paymentsAPI.getAll().catch(() => ({ data: [] })),
                coachesAPI.getAll().catch(() => ({ data: [] })),
                contactAPI.getAll().catch(() => ({ data: [] })),
                scheduleAPI.getWeekly().catch(() => ({ data: [] })),
                ordersAPI.getAll().catch(() => ({ data: [] }))
            ]);

            setMembers(membersRes.data || []);
            setPayments(paymentsRes.data || []);
            setCoaches(coachesRes.data || []);
            setContacts(contactsRes.data || []);
            setSchedule(scheduleRes.data || []);
            setOrders(ordersRes.data || []);

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
        setDataLoading(false);
    };

    const formatCurrency = (value: number) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
        return value.toString();
    };

    const openBottomSheet = (title: string, content: React.ReactNode) => {
        setSheetTitle(title);
        setSheetContent(content);
        setShowSheet(true);
    };

    // Generate chart data
    const getChartData = () => {
        const months = [];
        const now = new Date();
        for (let i = chartPeriod - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                name: `T${date.getMonth() + 1}`,
                revenue: 0
            });
        }
        return months;
    };

    // Loading State
    if (loading) {
        return (
            <div className="admin-login-page mobile">
                <div className="animate-fade-in" style={{ textAlign: 'center', color: '#fff' }}>
                    <div className="skeleton" style={{ width: 60, height: 60, borderRadius: '50%', margin: '0 auto 16px' }}></div>
                    <p>Đang tải...</p>
                </div>
            </div>
        );
    }

    // Login Page
    if (!isLoggedIn) {
        return (
            <div className="admin-login-page mobile">
                <div className="admin-login-card mobile animate-scale-in">
                    <div className="login-header">
                        <img src="/images/logo.png" alt="Logo" className="login-logo" />
                        <h1>ADMIN</h1>
                        <p>CLB Bóng Bàn Lê Quý Đôn</p>
                    </div>
                    <form onSubmit={handleLogin} className="login-form">
                        {loginError && (
                            <div className="login-error">
                                <i className="fas fa-exclamation-circle"></i>
                                {loginError}
                            </div>
                        )}
                        <div className="form-group">
                            <label>Tên đăng nhập</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Nhập username"
                                required
                                autoComplete="username"
                            />
                        </div>
                        <div className="form-group">
                            <label>Mật khẩu</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu"
                                required
                                autoComplete="current-password"
                            />
                        </div>
                        <button type="submit" className="btn-login">
                            <i className="fas fa-sign-in-alt"></i>
                            ĐĂNG NHẬP
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Main Admin Panel
    return (
        <div className="admin-panel mobile">
            {/* Header */}
            <header className="admin-header mobile">
                <div className="header-title">
                    <img src="/images/logo.png" alt="Logo" className="header-logo" />
                    <h1>
                        {activeTab === 'dashboard' && 'Tổng quan'}
                        {activeTab === 'schedule' && 'Lịch tập'}
                        {activeTab === 'revenue' && 'Doanh thu'}
                        {activeTab === 'orders' && 'Shop'}
                        {activeTab === 'settings' && 'Cài đặt'}
                    </h1>
                </div>
                <div className="header-actions">
                    <button className="btn-icon has-badge">
                        <i className="fas fa-bell"></i>
                        {(stats?.newContacts || 0) > 0 && <span className="badge">{stats.newContacts}</span>}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="admin-main mobile">
                {/* === DASHBOARD TAB === */}
                {activeTab === 'dashboard' && (
                    <div className="animate-fade-in">
                        {/* KPI Cards */}
                        <div className="kpi-scroll-container">
                            <div className="kpi-cards">
                                <div className="kpi-card" onClick={() => openBottomSheet('Chi tiết Doanh thu', <p>Thông tin doanh thu chi tiết...</p>)}>
                                    <div className="kpi-icon revenue">
                                        <i className="fas fa-wallet"></i>
                                    </div>
                                    <div className="kpi-value">{formatCurrency(stats?.totalRevenue || 0)}đ</div>
                                    <div className="kpi-label">Doanh thu tháng</div>
                                    <div className="kpi-trend up">
                                        <i className="fas fa-arrow-up"></i> +12%
                                    </div>
                                </div>

                                <div className="kpi-card">
                                    <div className="kpi-icon members">
                                        <i className="fas fa-users"></i>
                                    </div>
                                    <div className="kpi-value">{stats?.totalMembers || 0}</div>
                                    <div className="kpi-label">Học viên</div>
                                    <div className="kpi-trend up">
                                        <i className="fas fa-arrow-up"></i> +3
                                    </div>
                                </div>

                                <div className="kpi-card">
                                    <div className="kpi-icon coaches">
                                        <i className="fas fa-chalkboard-teacher"></i>
                                    </div>
                                    <div className="kpi-value">{stats?.totalCoaches || 0}</div>
                                    <div className="kpi-label">Huấn luyện viên</div>
                                </div>

                                <div className="kpi-card">
                                    <div className="kpi-icon orders">
                                        <i className="fas fa-shopping-bag"></i>
                                    </div>
                                    <div className="kpi-value">{stats?.newOrders || 0}</div>
                                    <div className="kpi-label">Đơn hàng mới</div>
                                </div>
                            </div>
                        </div>

                        {/* Revenue Chart */}
                        <div className="mobile-section" style={{ marginTop: 20 }}>
                            <div className="section-header">
                                <h3 className="section-title">
                                    <i className="fas fa-chart-bar"></i>
                                    Doanh thu
                                </h3>
                            </div>
                            <div className="chart-period-tabs">
                                <button className={chartPeriod === 3 ? 'active' : ''} onClick={() => setChartPeriod(3)}>3 tháng</button>
                                <button className={chartPeriod === 6 ? 'active' : ''} onClick={() => setChartPeriod(6)}>6 tháng</button>
                                <button className={chartPeriod === 12 ? 'active' : ''} onClick={() => setChartPeriod(12)}>12 tháng</button>
                            </div>
                            <div className="mobile-chart-container">
                                <ResponsiveContainer>
                                    <BarChart data={getChartData()}>
                                        <XAxis dataKey="name" stroke="#6b7280" axisLine={false} tickLine={false} fontSize={12} />
                                        <YAxis stroke="#6b7280" axisLine={false} tickLine={false} fontSize={11} tickFormatter={(v) => `${v / 1000000}M`} />
                                        <Tooltip
                                            contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 13 }}
                                            formatter={(value: number) => [`${value.toLocaleString('vi-VN')}₫`, 'Doanh thu']}
                                        />
                                        <Bar dataKey="revenue" fill="#e11d48" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent Coaches */}
                        <div className="mobile-section">
                            <div className="section-header">
                                <h3 className="section-title">
                                    <i className="fas fa-chalkboard-teacher"></i>
                                    Huấn luyện viên
                                </h3>
                                <button className="section-action">
                                    Tất cả <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                            {coaches.length > 0 ? (
                                <div className="mobile-list">
                                    {coaches.slice(0, 3).map((coach, index) => (
                                        <div key={coach.id || index} className="mobile-list-item animate-slide-up">
                                            <div className="item-avatar">
                                                {coach.avatar_url ? (
                                                    <img src={coach.avatar_url} alt={coach.full_name} />
                                                ) : (
                                                    <i className="fas fa-user"></i>
                                                )}
                                            </div>
                                            <div className="item-content">
                                                <div className="item-title">{coach.full_name}</div>
                                                <div className="item-subtitle">
                                                    {coach.phone || 'Chưa có SĐT'} • {coach.experience_years || 0} năm KN
                                                </div>
                                            </div>
                                            <span className="item-badge active">Hoạt động</span>
                                            <button className="item-action">
                                                <i className="fas fa-ellipsis-v"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mobile-empty-state">
                                    <div className="empty-icon"><i className="fas fa-user-tie"></i></div>
                                    <div className="empty-title">Chưa có HLV</div>
                                    <div className="empty-text">Thêm huấn luyện viên để bắt đầu quản lý.</div>
                                    <button className="empty-cta">
                                        <i className="fas fa-plus"></i> Thêm HLV
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Recent Contacts */}
                        <div className="mobile-section">
                            <div className="section-header">
                                <h3 className="section-title">
                                    <i className="fas fa-envelope"></i>
                                    Liên hệ mới
                                </h3>
                                {contacts.length > 0 && (
                                    <button className="section-action">
                                        Xem tất cả <i className="fas fa-chevron-right"></i>
                                    </button>
                                )}
                            </div>
                            {contacts.length > 0 ? (
                                <div className="mobile-list">
                                    {contacts.slice(0, 3).map((contact, index) => (
                                        <div key={contact.id || index} className="mobile-list-item animate-slide-up">
                                            <div className="item-avatar">
                                                <i className="fas fa-envelope"></i>
                                            </div>
                                            <div className="item-content">
                                                <div className="item-title">{contact.name || 'Ẩn danh'}</div>
                                                <div className="item-subtitle">{contact.subject || contact.message?.substring(0, 30) || 'Không có nội dung'}</div>
                                            </div>
                                            {contact.status === 'new' && <span className="item-badge new">Mới</span>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mobile-empty-state">
                                    <div className="empty-icon"><i className="fas fa-inbox"></i></div>
                                    <div className="empty-title">Không có liên hệ mới</div>
                                    <div className="empty-text">Các tin nhắn từ khách hàng sẽ hiển thị ở đây.</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* === SCHEDULE TAB === */}
                {activeTab === 'schedule' && (
                    <div className="animate-fade-in">
                        <div className="mobile-section">
                            <div className="section-header">
                                <h3 className="section-title">
                                    <i className="fas fa-calendar-alt"></i>
                                    Lịch tập hôm nay
                                </h3>
                            </div>
                            {schedule.length > 0 ? (
                                <div className="mobile-list">
                                    {schedule.slice(0, 5).map((session, index) => (
                                        <div key={session.id || index} className="mobile-list-item animate-slide-up">
                                            <div className="item-avatar" style={{ background: 'rgba(79, 70, 229, 0.12)' }}>
                                                <i className="fas fa-clock" style={{ color: '#4f46e5' }}></i>
                                            </div>
                                            <div className="item-content">
                                                <div className="item-title">{session.coach_name || 'HLV'}</div>
                                                <div className="item-subtitle">{session.start_time} - {session.end_time}</div>
                                            </div>
                                            <span className="item-badge active">Đang dạy</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mobile-empty-state">
                                    <div className="empty-icon"><i className="fas fa-calendar-times"></i></div>
                                    <div className="empty-title">Không có lịch</div>
                                    <div className="empty-text">Hôm nay chưa có buổi tập nào được lên lịch.</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* === REVENUE TAB === */}
                {activeTab === 'revenue' && (
                    <div className="animate-fade-in">
                        <div className="kpi-scroll-container" style={{ marginBottom: 20 }}>
                            <div className="kpi-cards">
                                <div className="kpi-card" style={{ flex: '0 0 100%' }}>
                                    <div className="kpi-icon revenue">
                                        <i className="fas fa-chart-line"></i>
                                    </div>
                                    <div className="kpi-value">{formatCurrency(stats?.totalRevenue || 0)}đ</div>
                                    <div className="kpi-label">Tổng doanh thu</div>
                                </div>
                            </div>
                        </div>
                        <div className="mobile-section">
                            <div className="section-header">
                                <h3 className="section-title">
                                    <i className="fas fa-receipt"></i>
                                    Giao dịch gần đây
                                </h3>
                            </div>
                            {payments.length > 0 ? (
                                <div className="mobile-list">
                                    {payments.slice(0, 10).map((payment, index) => (
                                        <div key={payment.id || index} className="mobile-list-item animate-slide-up">
                                            <div className="item-avatar" style={{ background: 'rgba(16, 185, 129, 0.12)' }}>
                                                <i className="fas fa-money-bill-wave" style={{ color: '#10b981' }}></i>
                                            </div>
                                            <div className="item-content">
                                                <div className="item-title">{Number(payment.amount).toLocaleString('vi-VN')}đ</div>
                                                <div className="item-subtitle">{payment.payment_type || 'Thanh toán'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mobile-empty-state">
                                    <div className="empty-icon"><i className="fas fa-coins"></i></div>
                                    <div className="empty-title">Chưa có giao dịch</div>
                                    <div className="empty-text">Các khoản thanh toán sẽ hiển thị ở đây.</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* === ORDERS TAB === */}
                {activeTab === 'orders' && (
                    <div className="animate-fade-in">
                        <div className="mobile-section">
                            <div className="section-header">
                                <h3 className="section-title">
                                    <i className="fas fa-shopping-bag"></i>
                                    Đơn hàng
                                </h3>
                            </div>
                            {orders.length > 0 ? (
                                <div className="mobile-list">
                                    {orders.map((order, index) => (
                                        <div key={order.id || index} className="mobile-list-item animate-slide-up">
                                            <div className="item-avatar" style={{ background: 'rgba(245, 158, 11, 0.12)' }}>
                                                <i className="fas fa-box" style={{ color: '#f59e0b' }}></i>
                                            </div>
                                            <div className="item-content">
                                                <div className="item-title">{order.customer_name || 'Khách hàng'}</div>
                                                <div className="item-subtitle">{Number(order.total_amount || 0).toLocaleString('vi-VN')}đ</div>
                                            </div>
                                            <span className={`item-badge ${order.status === 'new' ? 'new' : order.status === 'pending' ? 'pending' : 'active'}`}>
                                                {order.status === 'new' ? 'Mới' : order.status === 'pending' ? 'Chờ xử lý' : order.status}
                                            </span>
                                            <button className="item-action">
                                                <i className="fas fa-ellipsis-v"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mobile-empty-state">
                                    <div className="empty-icon"><i className="fas fa-shopping-cart"></i></div>
                                    <div className="empty-title">Chưa có đơn hàng</div>
                                    <div className="empty-text">Đơn hàng từ Shop sẽ hiển thị ở đây.</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* === SETTINGS TAB === */}
                {activeTab === 'settings' && (
                    <div className="animate-fade-in">
                        <div className="mobile-section">
                            <div className="section-header">
                                <h3 className="section-title">
                                    <i className="fas fa-user-circle"></i>
                                    Tài khoản
                                </h3>
                            </div>
                            <div className="mobile-list">
                                <div className="mobile-list-item">
                                    <div className="item-avatar">
                                        <i className="fas fa-user"></i>
                                    </div>
                                    <div className="item-content">
                                        <div className="item-title">{user?.full_name || user?.username}</div>
                                        <div className="item-subtitle">{user?.role || 'Admin'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mobile-section">
                            <div className="section-header">
                                <h3 className="section-title">
                                    <i className="fas fa-cog"></i>
                                    Cài đặt
                                </h3>
                            </div>
                            <div className="mobile-list">
                                <div className="mobile-list-item">
                                    <div className="item-avatar" style={{ background: 'rgba(79, 70, 229, 0.12)' }}>
                                        <i className="fas fa-bell" style={{ color: '#4f46e5' }}></i>
                                    </div>
                                    <div className="item-content">
                                        <div className="item-title">Thông báo</div>
                                        <div className="item-subtitle">Quản lý thông báo đẩy</div>
                                    </div>
                                    <i className="fas fa-chevron-right" style={{ color: '#9ca3af' }}></i>
                                </div>
                                <div className="mobile-list-item">
                                    <div className="item-avatar" style={{ background: 'rgba(16, 185, 129, 0.12)' }}>
                                        <i className="fas fa-shield-alt" style={{ color: '#10b981' }}></i>
                                    </div>
                                    <div className="item-content">
                                        <div className="item-title">Bảo mật</div>
                                        <div className="item-subtitle">Đổi mật khẩu, xác thực 2 bước</div>
                                    </div>
                                    <i className="fas fa-chevron-right" style={{ color: '#9ca3af' }}></i>
                                </div>
                            </div>
                        </div>

                        <div className="mobile-section" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <button
                                onClick={handleLogout}
                                className="mobile-list-item"
                                style={{ background: 'transparent', width: '100%', justifyContent: 'center', padding: '16px' }}
                            >
                                <i className="fas fa-sign-out-alt" style={{ color: '#ef4444', fontSize: 18, marginRight: 10 }}></i>
                                <span style={{ color: '#ef4444', fontWeight: 600, fontSize: 15 }}>Đăng xuất</span>
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Navigation */}
            <nav className="admin-bottom-nav">
                <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                    <i className="fas fa-home"></i>
                    <span>Tổng quan</span>
                </button>
                <button className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
                    <i className="fas fa-calendar-alt"></i>
                    <span>Lịch tập</span>
                </button>
                <button className={`nav-item ${activeTab === 'revenue' ? 'active' : ''}`} onClick={() => setActiveTab('revenue')}>
                    <i className="fas fa-wallet"></i>
                    <span>Doanh thu</span>
                </button>
                <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                    <i className="fas fa-shopping-bag"></i>
                    <span>Shop</span>
                    {(stats?.newOrders || 0) > 0 && <span className="nav-badge">{stats.newOrders}</span>}
                </button>
                <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                    <i className="fas fa-cog"></i>
                    <span>Cài đặt</span>
                </button>
            </nav>

            {/* Bottom Sheet */}
            <div className={`bottom-sheet-overlay ${showSheet ? 'active' : ''}`} onClick={() => setShowSheet(false)}></div>
            <div className={`bottom-sheet ${showSheet ? 'active' : ''}`}>
                <div className="sheet-handle"></div>
                <div className="sheet-header">
                    <h3 className="sheet-title">{sheetTitle}</h3>
                    <button className="sheet-close" onClick={() => setShowSheet(false)}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="sheet-content">
                    {sheetContent}
                </div>
            </div>
        </div>
    );
};

export default AdminPanelMobile;
