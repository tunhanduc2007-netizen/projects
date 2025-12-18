import React, { useState, useEffect } from 'react';
import { shopAdminAPI } from '../services/api';

// ===== Interfaces =====
interface ShopOrder {
    id: string;
    order_code: string;
    customer_name: string;
    customer_phone: string;
    customer_note?: string;
    total_amount: number;
    payment_method: 'qr' | 'bank';
    payment_status: 'pending' | 'paid' | 'confirmed';
    order_status: 'new' | 'processing' | 'done' | 'cancelled';
    transfer_content: string;
    qr_code_url: string;
    admin_note?: string;
    created_at: string;
    item_count?: number;
    items?: {
        id: string;
        product_name: string;
        product_brand: string;
        product_price: number;
        product_image: string;
        quantity: number;
        subtotal: number;
    }[];
    payment?: {
        bank_name: string;
        bank_code: string;
        account_number: string;
        account_holder: string;
        status: string;
    };
}

interface ShopStats {
    total_orders: number;
    pending_orders: number;
    paid_orders: number;
    confirmed_orders: number;
    new_orders: number;
    processing_orders: number;
    done_orders: number;
    cancelled_orders: number;
    total_revenue: number;
    confirmed_revenue: number;
    today_orders: number;
    today_revenue: number;
    active_products: number;
}

// ===== Helper Functions =====
const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
};

const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('vi-VN', {
        dateStyle: 'short',
        timeStyle: 'short'
    });
};

const getPaymentStatusLabel = (status: string): { label: string; color: string } => {
    const map: Record<string, { label: string; color: string }> = {
        'pending': { label: 'Chờ thanh toán', color: '#f59e0b' },
        'paid': { label: 'Đã thanh toán', color: '#3b82f6' },
        'confirmed': { label: 'Đã xác nhận', color: '#10b981' },
    };
    return map[status] || { label: status, color: '#6b7280' };
};

const getOrderStatusLabel = (status: string): { label: string; color: string } => {
    const map: Record<string, { label: string; color: string }> = {
        'new': { label: 'Mới', color: '#6366f1' },
        'processing': { label: 'Đang xử lý', color: '#3b82f6' },
        'done': { label: 'Hoàn tất', color: '#10b981' },
        'cancelled': { label: 'Đã huỷ', color: '#ef4444' },
    };
    return map[status] || { label: status, color: '#6b7280' };
};

// ===== Main Component =====
const ShopAdminPanel: React.FC = () => {
    // State
    const [activeTab, setActiveTab] = useState<'stats' | 'orders' | 'products'>('stats');
    const [stats, setStats] = useState<ShopStats | null>(null);
    const [orders, setOrders] = useState<ShopOrder[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [paymentFilter, setPaymentFilter] = useState<string>('');
    const [orderFilter, setOrderFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');

    // Load data on mount
    useEffect(() => {
        loadStats();
    }, []);

    useEffect(() => {
        if (activeTab === 'orders') {
            loadOrders();
        }
    }, [activeTab, paymentFilter, orderFilter, searchQuery]);

    // API Calls
    const loadStats = async () => {
        try {
            setLoading(true);
            const response = await shopAdminAPI.getStats();
            setStats(response.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadOrders = async () => {
        try {
            setLoading(true);
            const response = await shopAdminAPI.getOrders({
                payment_status: paymentFilter || undefined,
                order_status: orderFilter || undefined,
                search: searchQuery || undefined,
            });
            setOrders(response.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadOrderDetail = async (id: string) => {
        try {
            const response = await shopAdminAPI.getOrderById(id);
            setSelectedOrder(response.data);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const updateOrderStatus = async (id: string, status: string) => {
        try {
            await shopAdminAPI.updateOrderStatus(id, status);
            await loadOrders();
            if (selectedOrder?.id === id) {
                await loadOrderDetail(id);
            }
        } catch (err: any) {
            alert(err.message);
        }
    };

    const confirmPayment = async (id: string) => {
        if (!confirm('Xác nhận đã nhận tiền cho đơn hàng này?')) return;

        try {
            await shopAdminAPI.confirmPayment(id);
            await loadOrders();
            await loadStats();
            if (selectedOrder?.id === id) {
                await loadOrderDetail(id);
            }
            alert('Đã xác nhận thanh toán!');
        } catch (err: any) {
            alert(err.message);
        }
    };

    // Render Stats Tab
    const renderStats = () => {
        if (!stats) return null;

        return (
            <div className="shop-admin-stats">
                <h2>📊 THỐNG KÊ CỬA HÀNG</h2>

                <div className="stats-grid">
                    <div className="stat-card primary">
                        <div className="stat-icon"><i className="fas fa-shopping-cart"></i></div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.total_orders}</span>
                            <span className="stat-label">Tổng đơn hàng</span>
                        </div>
                    </div>

                    <div className="stat-card warning">
                        <div className="stat-icon"><i className="fas fa-clock"></i></div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.pending_orders}</span>
                            <span className="stat-label">Chờ thanh toán</span>
                        </div>
                    </div>

                    <div className="stat-card success">
                        <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.confirmed_orders}</span>
                            <span className="stat-label">Đã xác nhận</span>
                        </div>
                    </div>

                    <div className="stat-card info">
                        <div className="stat-icon"><i className="fas fa-box"></i></div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.active_products}</span>
                            <span className="stat-label">Sản phẩm</span>
                        </div>
                    </div>
                </div>

                <div className="revenue-section">
                    <h3>💰 Doanh thu</h3>
                    <div className="revenue-grid">
                        <div className="revenue-card">
                            <span className="revenue-label">Hôm nay ({stats.today_orders} đơn)</span>
                            <span className="revenue-value">{formatPrice(stats.today_revenue)}</span>
                        </div>
                        <div className="revenue-card total">
                            <span className="revenue-label">Tổng doanh thu (đã xác nhận)</span>
                            <span className="revenue-value">{formatPrice(stats.confirmed_revenue)}</span>
                        </div>
                    </div>
                </div>

                <div className="order-status-section">
                    <h3>📦 Trạng thái đơn hàng</h3>
                    <div className="status-grid">
                        <div className="status-item">
                            <span className="status-count">{stats.new_orders}</span>
                            <span className="status-label">Mới</span>
                        </div>
                        <div className="status-item">
                            <span className="status-count">{stats.processing_orders}</span>
                            <span className="status-label">Đang xử lý</span>
                        </div>
                        <div className="status-item">
                            <span className="status-count">{stats.done_orders}</span>
                            <span className="status-label">Hoàn tất</span>
                        </div>
                        <div className="status-item cancelled">
                            <span className="status-count">{stats.cancelled_orders}</span>
                            <span className="status-label">Đã huỷ</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Render Orders Tab
    const renderOrders = () => (
        <div className="shop-admin-orders">
            <h2>📋 QUẢN LÝ ĐƠN HÀNG</h2>

            {/* Filters */}
            <div className="orders-filters">
                <div className="filter-group">
                    <label>Thanh toán:</label>
                    <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
                        <option value="">Tất cả</option>
                        <option value="pending">Chờ thanh toán</option>
                        <option value="paid">Đã thanh toán</option>
                        <option value="confirmed">Đã xác nhận</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Trạng thái:</label>
                    <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)}>
                        <option value="">Tất cả</option>
                        <option value="new">Mới</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="done">Hoàn tất</option>
                        <option value="cancelled">Đã huỷ</option>
                    </select>
                </div>
                <div className="filter-group search">
                    <input
                        type="text"
                        placeholder="Tìm mã đơn, tên, SĐT..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button onClick={loadOrders}><i className="fas fa-search"></i></button>
                </div>
            </div>

            {/* Orders Table */}
            {loading ? (
                <div className="loading-state">
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang tải...
                </div>
            ) : orders.length === 0 ? (
                <div className="empty-state">
                    <i className="fas fa-inbox"></i>
                    <p>Không có đơn hàng nào</p>
                </div>
            ) : (
                <div className="orders-table-wrapper">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Khách hàng</th>
                                <th>Tổng tiền</th>
                                <th>Thanh toán</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => {
                                const paymentStatus = getPaymentStatusLabel(order.payment_status);
                                const orderStatus = getOrderStatusLabel(order.order_status);
                                return (
                                    <tr key={order.id}>
                                        <td className="order-code">{order.order_code}</td>
                                        <td>
                                            <div className="customer-info">
                                                <strong>{order.customer_name}</strong>
                                                <span>{order.customer_phone}</span>
                                            </div>
                                        </td>
                                        <td className="amount">{formatPrice(order.total_amount)}</td>
                                        <td>
                                            <span className="status-badge" style={{ background: paymentStatus.color }}>
                                                {paymentStatus.label}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="status-badge outline" style={{ borderColor: orderStatus.color, color: orderStatus.color }}>
                                                {orderStatus.label}
                                            </span>
                                        </td>
                                        <td className="date">{formatDate(order.created_at)}</td>
                                        <td className="actions">
                                            <button
                                                className="btn-view"
                                                onClick={() => loadOrderDetail(order.id)}
                                                title="Xem chi tiết"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            {order.payment_status === 'pending' && (
                                                <button
                                                    className="btn-confirm"
                                                    onClick={() => confirmPayment(order.id)}
                                                    title="Xác nhận thanh toán"
                                                >
                                                    <i className="fas fa-check"></i>
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

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="order-modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="order-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Chi tiết đơn hàng</h3>
                            <button className="modal-close" onClick={() => setSelectedOrder(null)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="order-detail-header">
                                <div className="order-code-big">{selectedOrder.order_code}</div>
                                <div className="order-statuses">
                                    <span
                                        className="status-badge"
                                        style={{ background: getPaymentStatusLabel(selectedOrder.payment_status).color }}
                                    >
                                        {getPaymentStatusLabel(selectedOrder.payment_status).label}
                                    </span>
                                    <span
                                        className="status-badge outline"
                                        style={{
                                            borderColor: getOrderStatusLabel(selectedOrder.order_status).color,
                                            color: getOrderStatusLabel(selectedOrder.order_status).color
                                        }}
                                    >
                                        {getOrderStatusLabel(selectedOrder.order_status).label}
                                    </span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4><i className="fas fa-user"></i> Khách hàng</h4>
                                <div className="detail-row">
                                    <span>Họ tên:</span>
                                    <strong>{selectedOrder.customer_name}</strong>
                                </div>
                                <div className="detail-row">
                                    <span>Điện thoại:</span>
                                    <strong>
                                        <a href={`tel:${selectedOrder.customer_phone}`}>
                                            {selectedOrder.customer_phone}
                                        </a>
                                    </strong>
                                </div>
                                {selectedOrder.customer_note && (
                                    <div className="detail-row">
                                        <span>Ghi chú:</span>
                                        <strong>{selectedOrder.customer_note}</strong>
                                    </div>
                                )}
                            </div>

                            <div className="detail-section">
                                <h4><i className="fas fa-box"></i> Sản phẩm</h4>
                                {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                                    <div key={idx} className="item-row">
                                        <span className="item-name">{item.product_name}</span>
                                        <span className="item-qty">x{item.quantity}</span>
                                        <span className="item-price">{formatPrice(item.subtotal)}</span>
                                    </div>
                                ))}
                                <div className="total-row">
                                    <span>Tổng cộng:</span>
                                    <strong>{formatPrice(selectedOrder.total_amount)}</strong>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4><i className="fas fa-credit-card"></i> Thanh toán</h4>
                                <div className="detail-row">
                                    <span>Nội dung CK:</span>
                                    <strong className="transfer-content">{selectedOrder.transfer_content}</strong>
                                </div>
                                <div className="qr-preview">
                                    <img src={selectedOrder.qr_code_url} alt="QR Code" />
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4><i className="fas fa-cog"></i> Cập nhật trạng thái</h4>
                                <div className="status-actions">
                                    {selectedOrder.payment_status !== 'confirmed' && (
                                        <button
                                            className="btn-action confirm"
                                            onClick={() => confirmPayment(selectedOrder.id)}
                                        >
                                            <i className="fas fa-check-double"></i>
                                            Xác nhận thanh toán
                                        </button>
                                    )}
                                    {selectedOrder.order_status !== 'done' && selectedOrder.order_status !== 'cancelled' && (
                                        <>
                                            {selectedOrder.order_status === 'new' && (
                                                <button
                                                    className="btn-action process"
                                                    onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                                                >
                                                    <i className="fas fa-spinner"></i>
                                                    Đang xử lý
                                                </button>
                                            )}
                                            <button
                                                className="btn-action done"
                                                onClick={() => updateOrderStatus(selectedOrder.id, 'done')}
                                            >
                                                <i className="fas fa-check-circle"></i>
                                                Hoàn tất
                                            </button>
                                            <button
                                                className="btn-action cancel"
                                                onClick={() => {
                                                    if (confirm('Huỷ đơn hàng này?')) {
                                                        updateOrderStatus(selectedOrder.id, 'cancelled');
                                                    }
                                                }}
                                            >
                                                <i className="fas fa-times-circle"></i>
                                                Huỷ đơn
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Render Products Tab (Placeholder)
    const renderProducts = () => (
        <div className="shop-admin-products">
            <h2>📦 QUẢN LÝ SẢN PHẨM</h2>
            <div className="coming-soon">
                <i className="fas fa-tools"></i>
                <p>Tính năng quản lý sản phẩm đang được phát triển...</p>
                <small>Hiện tại sản phẩm được quản lý thông qua database</small>
            </div>
        </div>
    );

    // Main Render
    return (
        <div className="shop-admin-panel">
            <div className="shop-admin-header">
                <h1><i className="fas fa-store"></i> Quản lý Cửa hàng</h1>
            </div>

            <div className="shop-admin-tabs">
                <button
                    className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stats')}
                >
                    <i className="fas fa-chart-bar"></i>
                    Thống kê
                </button>
                <button
                    className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    <i className="fas fa-shopping-bag"></i>
                    Đơn hàng
                    {stats && stats.pending_orders > 0 && (
                        <span className="badge">{stats.pending_orders}</span>
                    )}
                </button>
                <button
                    className={`tab ${activeTab === 'products' ? 'active' : ''}`}
                    onClick={() => setActiveTab('products')}
                >
                    <i className="fas fa-boxes"></i>
                    Sản phẩm
                </button>
            </div>

            <div className="shop-admin-content">
                {error && (
                    <div className="error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        {error}
                        <button onClick={() => setError(null)}>×</button>
                    </div>
                )}

                {activeTab === 'stats' && renderStats()}
                {activeTab === 'orders' && renderOrders()}
                {activeTab === 'products' && renderProducts()}
            </div>
        </div>
    );
};

export default ShopAdminPanel;
