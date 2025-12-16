import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminLogin from './AdminLogin';
import { getMemberStats } from '../../firebase/services/memberService';
import { getContactStats } from '../../firebase/services/contactService';
import { getShopStats } from '../../firebase/services/shopService';
import { getAllBookings } from '../../firebase/services/scheduleService';

// Các tab trong dashboard
type TabType = 'overview' | 'members' | 'schedule' | 'shop' | 'contacts' | 'settings';

const AdminDashboard: React.FC = () => {
    const { user, adminInfo, loading, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [stats, setStats] = useState({
        members: { total: 0, active: 0, pending: 0 },
        contacts: { total: 0, new: 0 },
        shop: { totalProducts: 0, totalOrders: 0, totalRevenue: 0 },
        bookings: 0
    });
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadStats();
        }
    }, [user]);

    const loadStats = async () => {
        setStatsLoading(true);
        try {
            const [memberStats, contactStats, shopStats, bookings] = await Promise.all([
                getMemberStats(),
                getContactStats(),
                getShopStats(),
                getAllBookings()
            ]);

            setStats({
                members: memberStats,
                contacts: contactStats,
                shop: shopStats,
                bookings: bookings.length
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="admin-loading-spinner"></div>
                <p>Đang tải...</p>
            </div>
        );
    }

    if (!user || !adminInfo) {
        return <AdminLogin onLoginSuccess={() => window.location.reload()} />;
    }

    const menuItems = [
        { id: 'overview' as TabType, label: 'Tổng quan', icon: '📊' },
        { id: 'members' as TabType, label: 'Thành viên', icon: '👥' },
        { id: 'schedule' as TabType, label: 'Lịch tập', icon: '📅' },
        { id: 'shop' as TabType, label: 'Cửa hàng', icon: '🛒' },
        { id: 'contacts' as TabType, label: 'Liên hệ', icon: '✉️' },
        { id: 'settings' as TabType, label: 'Cài đặt', icon: '⚙️' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="admin-overview">
                        <h2>Tổng quan</h2>
                        {statsLoading ? (
                            <div className="stats-loading">Đang tải thống kê...</div>
                        ) : (
                            <div className="stats-grid">
                                <div className="stat-card stat-members">
                                    <div className="stat-icon">👥</div>
                                    <div className="stat-info">
                                        <h3>{stats.members.total}</h3>
                                        <p>Tổng thành viên</p>
                                        <span className="stat-badge">{stats.members.active} đang hoạt động</span>
                                    </div>
                                </div>

                                <div className="stat-card stat-bookings">
                                    <div className="stat-icon">📅</div>
                                    <div className="stat-info">
                                        <h3>{stats.bookings}</h3>
                                        <p>Lịch đặt sân</p>
                                        <span className="stat-badge">Tháng này</span>
                                    </div>
                                </div>

                                <div className="stat-card stat-orders">
                                    <div className="stat-icon">🛒</div>
                                    <div className="stat-info">
                                        <h3>{stats.shop.totalOrders}</h3>
                                        <p>Đơn hàng</p>
                                        <span className="stat-badge">{stats.shop.totalProducts} sản phẩm</span>
                                    </div>
                                </div>

                                <div className="stat-card stat-messages">
                                    <div className="stat-icon">✉️</div>
                                    <div className="stat-info">
                                        <h3>{stats.contacts.total}</h3>
                                        <p>Tin nhắn</p>
                                        <span className="stat-badge stat-new">{stats.contacts.new} mới</span>
                                    </div>
                                </div>

                                <div className="stat-card stat-revenue">
                                    <div className="stat-icon">💰</div>
                                    <div className="stat-info">
                                        <h3>{new Intl.NumberFormat('vi-VN').format(stats.shop.totalRevenue)}₫</h3>
                                        <p>Doanh thu</p>
                                        <span className="stat-badge">Tổng cộng</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="quick-actions">
                            <h3>Thao tác nhanh</h3>
                            <div className="actions-grid">
                                <button onClick={() => setActiveTab('members')}>
                                    <span>➕</span> Thêm thành viên
                                </button>
                                <button onClick={() => setActiveTab('schedule')}>
                                    <span>📅</span> Quản lý lịch
                                </button>
                                <button onClick={() => setActiveTab('shop')}>
                                    <span>📦</span> Thêm sản phẩm
                                </button>
                                <button onClick={() => setActiveTab('contacts')}>
                                    <span>📬</span> Xem tin nhắn
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'members':
                return (
                    <div className="admin-section">
                        <h2>Quản lý thành viên</h2>
                        <div className="section-toolbar">
                            <button className="btn-primary">➕ Thêm thành viên</button>
                            <input type="search" placeholder="Tìm kiếm..." />
                        </div>
                        <div className="placeholder-content">
                            <p>📋 Danh sách thành viên sẽ hiển thị ở đây</p>
                            <p className="hint">Kết nối Firebase để xem dữ liệu thực</p>
                        </div>
                    </div>
                );

            case 'schedule':
                return (
                    <div className="admin-section">
                        <h2>Quản lý lịch tập</h2>
                        <div className="section-toolbar">
                            <button className="btn-primary">➕ Thêm slot</button>
                            <select>
                                <option>Tất cả ngày</option>
                                <option>Thứ 2</option>
                                <option>Thứ 3</option>
                                <option>Thứ 4</option>
                                <option>Thứ 5</option>
                                <option>Thứ 6</option>
                                <option>Thứ 7</option>
                                <option>Chủ nhật</option>
                            </select>
                        </div>
                        <div className="placeholder-content">
                            <p>📅 Lịch tập và booking sẽ hiển thị ở đây</p>
                            <p className="hint">Kết nối Firebase để xem dữ liệu thực</p>
                        </div>
                    </div>
                );

            case 'shop':
                return (
                    <div className="admin-section">
                        <h2>Quản lý cửa hàng</h2>
                        <div className="section-tabs">
                            <button className="tab-active">Sản phẩm</button>
                            <button>Đơn hàng</button>
                            <button>Danh mục</button>
                        </div>
                        <div className="section-toolbar">
                            <button className="btn-primary">➕ Thêm sản phẩm</button>
                            <input type="search" placeholder="Tìm sản phẩm..." />
                        </div>
                        <div className="placeholder-content">
                            <p>🛒 Sản phẩm và đơn hàng sẽ hiển thị ở đây</p>
                            <p className="hint">Kết nối Firebase để xem dữ liệu thực</p>
                        </div>
                    </div>
                );

            case 'contacts':
                return (
                    <div className="admin-section">
                        <h2>Tin nhắn liên hệ</h2>
                        <div className="section-tabs">
                            <button className="tab-active">Tất cả ({stats.contacts.total})</button>
                            <button>Mới ({stats.contacts.new})</button>
                            <button>Đã xử lý</button>
                        </div>
                        <div className="placeholder-content">
                            <p>✉️ Tin nhắn liên hệ sẽ hiển thị ở đây</p>
                            <p className="hint">Kết nối Firebase để xem dữ liệu thực</p>
                        </div>
                    </div>
                );

            case 'settings':
                return (
                    <div className="admin-section">
                        <h2>Cài đặt</h2>
                        <div className="settings-grid">
                            <div className="settings-card">
                                <h3>👤 Thông tin tài khoản</h3>
                                <p>Email: {adminInfo.email}</p>
                                <p>Vai trò: {adminInfo.role}</p>
                                <button>Đổi mật khẩu</button>
                            </div>
                            <div className="settings-card">
                                <h3>🔔 Thông báo</h3>
                                <label>
                                    <input type="checkbox" defaultChecked /> Email khi có đơn hàng mới
                                </label>
                                <label>
                                    <input type="checkbox" defaultChecked /> Email khi có tin nhắn mới
                                </label>
                            </div>
                            <div className="settings-card">
                                <h3>🌐 Website</h3>
                                <p>Cấu hình website và SEO</p>
                                <button>Chỉnh sửa</button>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="admin-dashboard">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">🏓</div>
                    <h1>CLB LQĐ</h1>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {adminInfo.displayName?.charAt(0) || 'A'}
                        </div>
                        <div className="user-details">
                            <span className="user-name">{adminInfo.displayName}</span>
                            <span className="user-role">{adminInfo.role}</span>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={logout}>
                        🚪 Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <h1>{menuItems.find(m => m.id === activeTab)?.label}</h1>
                    <div className="header-actions">
                        <button className="btn-refresh" onClick={loadStats}>🔄 Làm mới</button>
                    </div>
                </header>

                <div className="admin-content">
                    {renderContent()}
                </div>
            </main>

            <style>{`
        .admin-dashboard {
          display: flex;
          min-height: 100vh;
          background: #0f0f23;
          color: white;
        }

        .admin-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #0f0f23;
          color: white;
        }

        .admin-loading-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: #dc2626;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Sidebar */
        .admin-sidebar {
          width: 260px;
          background: rgba(255, 255, 255, 0.03);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
        }

        .sidebar-header {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar-logo {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .sidebar-header h1 {
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .sidebar-nav {
          flex: 1;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.95rem;
          text-align: left;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .nav-item.active {
          background: linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(185, 28, 28, 0.1));
          color: white;
          border: 1px solid rgba(220, 38, 38, 0.3);
        }

        .nav-icon {
          font-size: 1.2rem;
        }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          margin-bottom: 12px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 500;
          font-size: 0.9rem;
        }

        .user-role {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: capitalize;
        }

        .logout-btn {
          width: 100%;
          padding: 10px;
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.2);
          border-radius: 8px;
          color: #fca5a5;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: rgba(220, 38, 38, 0.2);
        }

        /* Main Content */
        .admin-main {
          flex: 1;
          margin-left: 260px;
          display: flex;
          flex-direction: column;
        }

        .admin-header {
          padding: 20px 32px;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .admin-header h1 {
          font-size: 1.5rem;
          font-weight: 600;
        }

        .btn-refresh {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-refresh:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .admin-content {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
        }

        /* Overview */
        .admin-overview h2 {
          margin-bottom: 24px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          gap: 16px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          border-color: rgba(220, 38, 38, 0.3);
          transform: translateY(-2px);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          background: rgba(220, 38, 38, 0.1);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }

        .stat-info h3 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 4px;
        }

        .stat-info p {
          color: rgba(255, 255, 255, 0.6);
          margin: 0 0 8px;
          font-size: 0.9rem;
        }

        .stat-badge {
          display: inline-block;
          padding: 4px 10px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          font-size: 0.75rem;
        }

        .stat-badge.stat-new {
          background: rgba(34, 197, 94, 0.2);
          color: #86efac;
        }

        .quick-actions h3 {
          margin-bottom: 16px;
          color: rgba(255, 255, 255, 0.8);
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
        }

        .actions-grid button {
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .actions-grid button:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: #dc2626;
        }

        .actions-grid button span {
          font-size: 1.2rem;
        }

        /* Section styles */
        .admin-section h2 {
          margin-bottom: 20px;
        }

        .section-toolbar {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .btn-primary {
          padding: 10px 20px;
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
        }

        .section-toolbar input,
        .section-toolbar select {
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          min-width: 200px;
        }

        .section-toolbar input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .section-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }

        .section-tabs button {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .section-tabs button:hover,
        .section-tabs button.tab-active {
          background: rgba(220, 38, 38, 0.2);
          border-color: rgba(220, 38, 38, 0.3);
          color: white;
        }

        .placeholder-content {
          text-align: center;
          padding: 60px 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px dashed rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }

        .placeholder-content p {
          font-size: 1.1rem;
          margin: 0 0 8px;
        }

        .placeholder-content .hint {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.9rem;
        }

        /* Settings */
        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .settings-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 24px;
        }

        .settings-card h3 {
          margin: 0 0 16px;
          font-size: 1.1rem;
        }

        .settings-card p {
          color: rgba(255, 255, 255, 0.6);
          margin: 0 0 8px;
        }

        .settings-card label {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          cursor: pointer;
        }

        .settings-card button {
          margin-top: 12px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 6px;
          color: white;
          cursor: pointer;
        }

        .stats-loading {
          text-align: center;
          padding: 40px;
          color: rgba(255, 255, 255, 0.5);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .admin-sidebar {
            transform: translateX(-100%);
            z-index: 1000;
          }

          .admin-main {
            margin-left: 0;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
};

export default AdminDashboard;
