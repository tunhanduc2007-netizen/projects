import React, { useState, useEffect } from 'react';
import { authAPI, paymentsAPI, contactAPI, shopAdminAPI } from '../services/api';
import '../styles/admin-mobile.css';

/**
 * Admin Panel Mobile - Thiết kế cho người lớn tuổi (40-60)
 * - Chữ to, rõ ràng
 * - Không thuật ngữ tiếng Anh
 * - Chỉ 3 thông tin chính: Doanh thu hôm nay, Doanh thu tháng, Số đơn hàng
 * - Đơn hàng hiển thị dạng Card lớn, dễ đọc
 */

interface AdminUser {
    id: string;
    username: string;
    full_name: string;
    role: string;
}

const AdminPanelMobile: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<AdminUser | null>(null);
    const [activeTab, setActiveTab] = useState('home');
    const [loading, setLoading] = useState(true);

    // Login
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    // Data
    const [todayRevenue, setTodayRevenue] = useState(0);
    const [monthRevenue, setMonthRevenue] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    const [orders, setOrders] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);

    // Bottom Sheet
    const [showSheet, setShowSheet] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        if (authAPI.isLoggedIn()) {
            const savedUser = authAPI.getUser();
            setUser(savedUser);
            setIsLoggedIn(true);
            loadData();
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
            loadData();
        } catch (err: any) {
            setLoginError(err.message || 'Sai tên đăng nhập hoặc mật khẩu');
        }
    };

    const handleLogout = () => {
        authAPI.logout();
        setIsLoggedIn(false);
        setUser(null);
    };

    const loadData = async () => {
        try {
            const [paymentsRes, ordersRes, contactsRes] = await Promise.all([
                paymentsAPI.getAll().catch(() => ({ data: [] })),
                shopAdminAPI.getOrders().catch(() => ({ data: [] })),
                contactAPI.getAll().catch(() => ({ data: [] }))
            ]);

            const payments = paymentsRes.data || [];
            const ordersList = ordersRes.data || [];

            // Tính doanh thu hôm nay
            const today = new Date().toDateString();
            const todayPayments = payments.filter((p: any) =>
                new Date(p.created_at).toDateString() === today
            );
            setTodayRevenue(todayPayments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0));

            // Tính doanh thu tháng này
            const thisMonth = new Date().getMonth();
            const thisYear = new Date().getFullYear();
            const monthPayments = payments.filter((p: any) => {
                const d = new Date(p.created_at);
                return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
            });
            setMonthRevenue(monthPayments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0));

            // Số đơn hàng
            setOrderCount(ordersList.length);
            setOrders(ordersList);
            setContacts(contactsRes.data || []);

        } catch (err) {
            console.error('Lỗi tải dữ liệu:', err);
        }
    };

    // Format tiền VNĐ - Không dùng số thập phân
    const formatMoney = (value: number): string => {
        return value.toLocaleString('vi-VN') + 'đ';
    };

    // Format ngày giờ đơn giản
    const formatDate = (dateStr: string): string => {
        const d = new Date(dateStr);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    };

    // Mở chi tiết đơn hàng
    const openOrderDetail = (order: any) => {
        setSelectedOrder(order);
        setShowSheet(true);
    };

    // Get payment method label
    const getPaymentLabel = (method: string): string => {
        const labels: Record<string, string> = {
            'cash': 'Tiền mặt',
            'bank_transfer': 'Chuyển khoản',
            'momo': 'Ví MoMo',
            'zalo_pay': 'ZaloPay',
            'card': 'Thẻ ngân hàng'
        };
        return labels[method] || 'Chưa rõ';
    };

    // Get source label
    const getSourceLabel = (source: string): string => {
        const labels: Record<string, string> = {
            'website': 'Website',
            'facebook': 'Facebook',
            'zalo': 'Zalo',
            'phone': 'Gọi điện',
            'direct': 'Trực tiếp'
        };
        return labels[source] || 'Khác';
    };

    // Get status label
    const getStatusLabel = (status: string): string => {
        const labels: Record<string, string> = {
            'new': 'Mới',
            'pending': 'Đang xử lý',
            'confirmed': 'Đã xác nhận',
            'completed': 'Hoàn thành',
            'cancelled': 'Đã hủy'
        };
        return labels[status] || status;
    };

    // Loading
    if (loading) {
        return (
            <div className="elder-loading">
                <div className="elder-spinner"></div>
                <p>Đang tải...</p>
            </div>
        );
    }

    // Login Page
    if (!isLoggedIn) {
        return (
            <div className="elder-login">
                <div className="elder-login-card elder-animate-fade">
                    <div className="elder-login-header">
                        <img src="/images/logo.png" alt="Logo" className="elder-login-logo" />
                        <h1>ĐĂNG NHẬP</h1>
                        <p>Quản lý CLB Bóng Bàn</p>
                    </div>
                    <form onSubmit={handleLogin}>
                        {loginError && (
                            <div className="elder-login-error">
                                <i className="fas fa-exclamation-circle"></i>
                                {loginError}
                            </div>
                        )}
                        <div className="elder-form-group">
                            <label>Tên đăng nhập</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Nhập tên đăng nhập"
                                required
                                autoComplete="username"
                            />
                        </div>
                        <div className="elder-form-group">
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
                        <button type="submit" className="elder-btn-login">
                            <i className="fas fa-sign-in-alt"></i>
                            ĐĂNG NHẬP
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Main Panel
    return (
        <div className="admin-elder">
            {/* Header */}
            <header className="elder-header">
                <div className="elder-header-left">
                    <img src="/images/logo.png" alt="Logo" className="elder-header-logo" />
                    <h1>
                        {activeTab === 'home' && 'Tổng quan'}
                        {activeTab === 'orders' && 'Đơn hàng'}
                        {activeTab === 'settings' && 'Cài đặt'}
                    </h1>
                </div>
                <div className="elder-header-user">
                    <i className="fas fa-user-circle"></i>
                    <span>{user?.full_name || user?.username || 'Admin'}</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="elder-main">
                {/* === HOME TAB === */}
                {activeTab === 'home' && (
                    <div className="elder-dashboard elder-animate-fade">
                        {/* Card 1: Doanh thu hôm nay */}
                        <div className="elder-stat-card elder-animate-slide">
                            <div className="stat-label revenue">
                                <i className="fas fa-wallet"></i>
                                Doanh thu hôm nay
                            </div>
                            <div className="stat-value money">{formatMoney(todayRevenue)}</div>
                            <div className="stat-hint">Tổng tiền nhận được trong ngày</div>
                        </div>

                        {/* Card 2: Doanh thu tháng */}
                        <div className="elder-stat-card elder-animate-slide" style={{ animationDelay: '0.1s' }}>
                            <div className="stat-label month">
                                <i className="fas fa-calendar-alt"></i>
                                Doanh thu tháng này
                            </div>
                            <div className="stat-value money">{formatMoney(monthRevenue)}</div>
                            <div className="stat-hint">Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}</div>
                        </div>

                        {/* Card 3: Số đơn hàng */}
                        <div className="elder-stat-card elder-animate-slide" style={{ animationDelay: '0.2s' }}>
                            <div className="stat-label orders">
                                <i className="fas fa-shopping-bag"></i>
                                Tổng đơn hàng
                            </div>
                            <div className="stat-value">{orderCount} đơn</div>
                            <div className="stat-hint">Từ đầu đến nay</div>
                        </div>

                        {/* Quick Actions */}
                        <div style={{ marginTop: 24 }}>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className="elder-btn-detail"
                                style={{ background: 'var(--elder-primary)', color: '#fff', border: 'none' }}
                            >
                                <i className="fas fa-list"></i>
                                Xem danh sách đơn hàng
                            </button>
                        </div>
                    </div>
                )}

                {/* === ORDERS TAB === */}
                {activeTab === 'orders' && (
                    <div className="elder-animate-fade">
                        <h2 className="elder-section-title">
                            <i className="fas fa-receipt"></i>
                            Lịch sử đặt hàng
                        </h2>

                        {orders.length > 0 ? (
                            <div className="elder-order-list">
                                {orders.map((order, index) => (
                                    <div
                                        key={order.id || index}
                                        className={`elder-order-card elder-animate-slide ${order.order_status || 'new'}`}
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <div className="elder-order-header">
                                            <span className="elder-order-number">
                                                <i className="fas fa-shopping-cart"></i> {order.order_code}
                                            </span>
                                            <span className={`elder-order-status ${order.order_status || 'new'}`}>
                                                {order.order_status === 'new' && 'Mới'}
                                                {order.order_status === 'processing' && 'Đang xử lý'}
                                                {order.order_status === 'done' && 'Hoàn tất'}
                                                {order.order_status === 'cancelled' && 'Đã hủy'}
                                            </span>
                                        </div>

                                        <div className="elder-order-info">
                                            {/* Khách hàng */}
                                            <div className="elder-order-row">
                                                <i className="fas fa-user source"></i>
                                                <span style={{ fontWeight: 600 }}>{order.customer_name}</span>
                                            </div>

                                            {/* Số điện thoại */}
                                            <div className="elder-order-row">
                                                <i className="fas fa-phone payment"></i>
                                                <span>{order.customer_phone}</span>
                                            </div>

                                            {/* Số tiền */}
                                            <div className="elder-order-row">
                                                <i className="fas fa-money-bill-wave money"></i>
                                                <span className="amount">{formatMoney(Number(order.total_amount || 0))}</span>
                                            </div>

                                            {/* Thanh toán */}
                                            <div className="elder-order-row">
                                                <i className="fas fa-credit-card payment"></i>
                                                <span style={{
                                                    color: order.payment_status === 'confirmed' ? '#16a34a' :
                                                        order.payment_status === 'paid' ? '#2563eb' : '#d97706'
                                                }}>
                                                    {order.payment_status === 'pending' && 'Chờ thanh toán'}
                                                    {order.payment_status === 'paid' && 'Đã thanh toán'}
                                                    {order.payment_status === 'confirmed' && 'Đã xác nhận'}
                                                </span>
                                            </div>

                                            {/* Thời gian */}
                                            <div className="elder-order-row">
                                                <i className="fas fa-clock time"></i>
                                                <span>{order.created_at ? formatDate(order.created_at) : 'Không rõ'}</span>
                                            </div>
                                        </div>

                                        <div className="elder-order-action">
                                            <a
                                                href={`tel:${order.customer_phone}`}
                                                className="elder-btn-detail"
                                                style={{ background: '#16a34a', color: '#fff', textDecoration: 'none' }}
                                            >
                                                <i className="fas fa-phone"></i>
                                                Gọi khách
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="elder-empty">
                                <div className="elder-empty-icon">
                                    <i className="fas fa-inbox"></i>
                                </div>
                                <h3>Chưa có đơn hàng</h3>
                                <p>Khi có khách đặt hàng, đơn hàng sẽ hiện ở đây.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* === SETTINGS TAB === */}
                {activeTab === 'settings' && (
                    <div className="elder-animate-fade">
                        <div className="elder-settings-list">
                            {/* User Info */}
                            <div className="elder-settings-item">
                                <div className="elder-settings-icon user">
                                    <i className="fas fa-user"></i>
                                </div>
                                <div className="elder-settings-text">
                                    <h4>{user?.full_name || user?.username || 'Admin'}</h4>
                                    <p>Quản trị viên</p>
                                </div>
                            </div>

                            {/* Logout */}
                            <button className="elder-settings-item" onClick={handleLogout}>
                                <div className="elder-settings-icon logout">
                                    <i className="fas fa-sign-out-alt"></i>
                                </div>
                                <div className="elder-settings-text">
                                    <h4>Đăng xuất</h4>
                                    <p>Thoát khỏi tài khoản</p>
                                </div>
                                <i className="fas fa-chevron-right elder-settings-arrow"></i>
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Navigation - ONLY 3 TABS */}
            <nav className="elder-bottom-nav">
                <button
                    className={`elder-nav-item ${activeTab === 'home' ? 'active' : ''}`}
                    onClick={() => setActiveTab('home')}
                >
                    <i className="fas fa-home"></i>
                    <span>Tổng quan</span>
                </button>
                <button
                    className={`elder-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                    style={{ position: 'relative' }}
                >
                    <i className="fas fa-receipt"></i>
                    <span>Đơn hàng</span>
                    {orderCount > 0 && <span className="elder-nav-badge">{orderCount}</span>}
                </button>
                <button
                    className={`elder-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    <i className="fas fa-cog"></i>
                    <span>Cài đặt</span>
                </button>
            </nav>

            {/* Bottom Sheet - Order Detail */}
            <div
                className={`elder-sheet-overlay ${showSheet ? 'active' : ''}`}
                onClick={() => setShowSheet(false)}
            ></div>
            <div className={`elder-sheet ${showSheet ? 'active' : ''}`}>
                <div className="elder-sheet-handle"></div>
                <div className="elder-sheet-header">
                    <h3 className="elder-sheet-title">Chi tiết đơn hàng</h3>
                    <button className="elder-sheet-close" onClick={() => setShowSheet(false)}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                {selectedOrder && (
                    <div className="elder-sheet-content">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div>
                                <div style={{ fontSize: 15, color: 'var(--elder-text-light)', marginBottom: 6 }}>Khách hàng</div>
                                <div style={{ fontSize: 18, fontWeight: 600 }}>{selectedOrder.customer_name || 'Không rõ tên'}</div>
                            </div>

                            <div>
                                <div style={{ fontSize: 15, color: 'var(--elder-text-light)', marginBottom: 6 }}>Số điện thoại</div>
                                <div style={{ fontSize: 18, fontWeight: 600 }}>{selectedOrder.customer_phone || 'Không có'}</div>
                            </div>

                            <div>
                                <div style={{ fontSize: 15, color: 'var(--elder-text-light)', marginBottom: 6 }}>Tổng tiền</div>
                                <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--elder-primary)' }}>
                                    {formatMoney(Number(selectedOrder.total_amount || 0))}
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: 15, color: 'var(--elder-text-light)', marginBottom: 6 }}>Thanh toán bằng</div>
                                <div style={{ fontSize: 18, fontWeight: 600 }}>{getPaymentLabel(selectedOrder.payment_method || 'cash')}</div>
                            </div>

                            <div>
                                <div style={{ fontSize: 15, color: 'var(--elder-text-light)', marginBottom: 6 }}>Đặt qua</div>
                                <div style={{ fontSize: 18, fontWeight: 600 }}>{getSourceLabel(selectedOrder.source || 'website')}</div>
                            </div>

                            <div>
                                <div style={{ fontSize: 15, color: 'var(--elder-text-light)', marginBottom: 6 }}>Trạng thái</div>
                                <div style={{
                                    display: 'inline-block',
                                    padding: '10px 20px',
                                    borderRadius: 12,
                                    fontSize: 16,
                                    fontWeight: 700,
                                    background: selectedOrder.status === 'completed' ? 'rgba(22, 163, 74, 0.12)' : 'rgba(220, 38, 38, 0.12)',
                                    color: selectedOrder.status === 'completed' ? '#16a34a' : '#dc2626'
                                }}>
                                    {getStatusLabel(selectedOrder.status || 'new')}
                                </div>
                            </div>

                            {selectedOrder.notes && (
                                <div>
                                    <div style={{ fontSize: 15, color: 'var(--elder-text-light)', marginBottom: 6 }}>Ghi chú</div>
                                    <div style={{ fontSize: 17, lineHeight: 1.5 }}>{selectedOrder.notes}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanelMobile;
