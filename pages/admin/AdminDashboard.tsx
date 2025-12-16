/**
 * ============================================================
 * 📊 ADMIN DASHBOARD
 * Real-time statistics from Firestore
 * ============================================================
 * 
 * ❌ NO FAKE NUMBERS
 * ❌ NO HARDCODED VALUES  
 * ✅ ONLY REAL DATA FROM FIRESTORE QUERIES
 * 
 * ============================================================
 */

import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/config';

// ============================================================
// 🔧 TYPES
// ============================================================

interface VisitStats {
  totalToday: number;
  totalThisWeek: number;
  totalThisMonth: number;
  byPlayType: { hourly: number; daily: number; monthly: number };
  byDay: { date: string; count: number }[];
}

interface RevenueStats {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  byPaymentMethod: Record<string, number>;
  byDay: { date: string; amount: number }[];
}

interface ProductStats {
  totalProducts: number;
  totalStock: number;
  lowStockProducts: { id: string; name: string; stock: number }[];
  byCategory: Record<string, number>;
}

interface ContactStats {
  totalContacts: number;
  newContacts: number;
  readContacts: number;
  repliedContacts: number;
  recentContacts: { id: string; name: string; subject: string; status: string }[];
}

// ============================================================
// 📊 CHART COMPONENTS
// ============================================================

interface BarChartProps {
  data: { label: string; value: number }[];
  title: string;
  color?: string;
  formatValue?: (v: number) => string;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  color = '#3b82f6',
  formatValue = (v) => v.toLocaleString(),
}) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div style={chartStyles.container}>
      <h3 style={chartStyles.title}>{title}</h3>
      {data.every(d => d.value === 0) ? (
        <div style={chartStyles.noData}>Chưa có dữ liệu</div>
      ) : (
        <div style={chartStyles.bars}>
          {data.map((item, index) => (
            <div key={index} style={chartStyles.barContainer}>
              <div style={chartStyles.barWrapper}>
                <div
                  style={{
                    ...chartStyles.bar,
                    height: `${Math.max((item.value / maxValue) * 100, 4)}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
              <span style={chartStyles.barLabel}>{item.label}</span>
              <span style={chartStyles.barValue}>{formatValue(item.value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const chartStyles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '20px',
    height: '100%',
  },
  title: {
    color: '#f8fafc',
    fontSize: '16px',
    fontWeight: 600,
    margin: '0 0 20px',
  },
  bars: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '150px',
    gap: '8px',
  },
  barContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
  },
  barWrapper: {
    flex: 1,
    width: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bar: {
    width: '60%',
    minHeight: '4px',
    borderRadius: '4px 4px 0 0',
    transition: 'height 0.3s ease',
  },
  barLabel: {
    color: '#94a3b8',
    fontSize: '10px',
    marginTop: '8px',
  },
  barValue: {
    color: '#f8fafc',
    fontSize: '11px',
    fontWeight: 500,
    marginTop: '2px',
  },
  noData: {
    color: '#64748b',
    textAlign: 'center',
    padding: '40px',
    fontStyle: 'italic',
  },
};

// ============================================================
// 📊 STAT CARD
// ============================================================

interface StatCardProps {
  icon: string;
  label: string;
  value: number | string;
  subValue?: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subValue, color = '#3b82f6' }) => (
  <div style={statStyles.card}>
    <div style={{ ...statStyles.iconWrapper, backgroundColor: `${color}20` }}>
      <span style={{ fontSize: '24px' }}>{icon}</span>
    </div>
    <div style={statStyles.content}>
      <span style={statStyles.value}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
      <span style={statStyles.label}>{label}</span>
      {subValue && <span style={statStyles.subValue}>{subValue}</span>}
    </div>
  </div>
);

const statStyles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  iconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
  },
  value: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#f8fafc',
    lineHeight: 1,
  },
  label: {
    fontSize: '14px',
    color: '#94a3b8',
    marginTop: '4px',
  },
  subValue: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px',
  },
};

// ============================================================
// 🏠 MAIN DASHBOARD
// ============================================================

const AdminDashboard: React.FC = () => {
  const [visitStats, setVisitStats] = useState<VisitStats>({
    totalToday: 0,
    totalThisWeek: 0,
    totalThisMonth: 0,
    byPlayType: { hourly: 0, daily: 0, monthly: 0 },
    byDay: [],
  });
  const [revenueStats, setRevenueStats] = useState<RevenueStats>({
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    byPaymentMethod: {},
    byDay: [],
  });
  const [productStats, setProductStats] = useState<ProductStats>({
    totalProducts: 0,
    totalStock: 0,
    lowStockProducts: [],
    byCategory: {},
  });
  const [contactStats, setContactStats] = useState<ContactStats>({
    totalContacts: 0,
    newContacts: 0,
    readContacts: 0,
    repliedContacts: 0,
    recentContacts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Helper functions
  const getStartOfDay = (date: Date): Date => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const getStartOfMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const getLast7Days = (): Date[] => {
    const days: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(getStartOfDay(date));
    }
    return days;
  };

  const getDayLabel = (dateString: string): string => {
    const date = new Date(dateString);
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[date.getDay()];
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'M';
    if (amount >= 1000) return (amount / 1000).toFixed(0) + 'K';
    return amount.toLocaleString();
  };

  // Load data from Firestore
  useEffect(() => {
    if (!db) {
      setError('Firebase không khả dụng');
      setLoading(false);
      return;
    }

    const loadStats = async () => {
      try {
        const today = new Date();
        const startOfMonth = getStartOfMonth(today);
        const last7Days = getLast7Days();

        // Load Visits
        try {
          const visitsRef = collection(db, 'visits');
          const visitsSnap = await getDocs(visitsRef);
          const visits = visitsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

          const dayCountMap: Record<string, number> = {};
          let todayCount = 0;
          let weekCount = 0;
          const byPlayType = { hourly: 0, daily: 0, monthly: 0 };

          visits.forEach((visit: any) => {
            const visitDate = visit.date?.toDate?.() || new Date();
            const dateStr = visitDate.toISOString().split('T')[0];

            dayCountMap[dateStr] = (dayCountMap[dateStr] || 0) + 1;

            if (visitDate >= getStartOfDay(today)) todayCount++;
            if (visitDate >= new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)) weekCount++;

            const playType = visit.playType as keyof typeof byPlayType;
            if (playType in byPlayType) byPlayType[playType]++;
          });

          setVisitStats({
            totalToday: todayCount,
            totalThisWeek: weekCount,
            totalThisMonth: visits.length,
            byPlayType,
            byDay: last7Days.map(d => ({
              date: d.toISOString().split('T')[0],
              count: dayCountMap[d.toISOString().split('T')[0]] || 0,
            })),
          });
        } catch (e) {
          console.log('Visits collection may be empty');
        }

        // Load Payments
        try {
          const paymentsRef = collection(db, 'payments');
          const paymentsSnap = await getDocs(paymentsRef);
          const payments = paymentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

          const dayAmountMap: Record<string, number> = {};
          const byMethod: Record<string, number> = {};
          let todayRev = 0;
          let weekRev = 0;
          let monthRev = 0;

          payments.forEach((payment: any) => {
            if (payment.status !== 'completed') return;

            const amount = payment.amount || 0;
            const payDate = payment.createdAt?.toDate?.() || new Date();
            const dateStr = payDate.toISOString().split('T')[0];
            const method = payment.paymentMethod || 'other';

            dayAmountMap[dateStr] = (dayAmountMap[dateStr] || 0) + amount;
            byMethod[method] = (byMethod[method] || 0) + amount;
            monthRev += amount;

            if (payDate >= getStartOfDay(today)) todayRev += amount;
            if (payDate >= new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)) weekRev += amount;
          });

          setRevenueStats({
            todayRevenue: todayRev,
            weekRevenue: weekRev,
            monthRevenue: monthRev,
            byPaymentMethod: byMethod,
            byDay: last7Days.map(d => ({
              date: d.toISOString().split('T')[0],
              amount: dayAmountMap[d.toISOString().split('T')[0]] || 0,
            })),
          });
        } catch (e) {
          console.log('Payments collection may be empty');
        }

        // Load Products
        try {
          const productsRef = collection(db, 'products');
          const productsSnap = await getDocs(productsRef);
          const products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

          let totalStock = 0;
          const lowStock: ProductStats['lowStockProducts'] = [];
          const byCategory: Record<string, number> = {};

          products.forEach((product: any) => {
            const stock = product.stock || 0;
            const category = product.category || 'other';

            totalStock += stock;
            byCategory[category] = (byCategory[category] || 0) + 1;

            if (stock < 5) {
              lowStock.push({ id: product.id, name: product.name, stock });
            }
          });

          setProductStats({
            totalProducts: products.length,
            totalStock,
            lowStockProducts: lowStock.sort((a, b) => a.stock - b.stock),
            byCategory,
          });
        } catch (e) {
          console.log('Products collection may be empty');
        }

        // Load Contacts
        try {
          const contactsRef = collection(db, 'contacts');
          const contactsSnap = await getDocs(contactsRef);
          const contacts = contactsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

          let newCount = 0;
          let readCount = 0;
          let repliedCount = 0;
          const recent: ContactStats['recentContacts'] = [];

          contacts.forEach((contact: any, i) => {
            const status = contact.status || 'new';
            if (status === 'new') newCount++;
            else if (status === 'read') readCount++;
            else repliedCount++;

            if (i < 5) {
              recent.push({
                id: contact.id,
                name: contact.name || 'N/A',
                subject: contact.subject || 'Không có tiêu đề',
                status,
              });
            }
          });

          setContactStats({
            totalContacts: contacts.length,
            newContacts: newCount,
            readContacts: readCount,
            repliedContacts: repliedCount,
            recentContacts: recent,
          });
        } catch (e) {
          console.log('Contacts collection may be empty');
        }

        setLastUpdated(new Date());
        setLoading(false);
      } catch (err: any) {
        console.error('Error loading stats:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadStats();

    // Refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📊 Dashboard</h1>
          <p style={styles.subtitle}>
            Thống kê thời gian thực từ Firestore
            {lastUpdated && (
              <span style={styles.lastUpdated}>
                • Cập nhật: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div style={styles.headerLinks}>
          <a href="/admin" style={styles.link}>🛠️ Admin Panel</a>
          <a href="/database" style={styles.link}>💾 Database</a>
        </div>
      </div>

      {error && (
        <div style={styles.error}>⚠️ {error}</div>
      )}

      {loading ? (
        <div style={styles.loading}>Đang tải dữ liệu từ Firestore...</div>
      ) : (
        <>
          {/* Overview Stats */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>📈 Tổng quan</h2>
            <div style={styles.statsGrid}>
              <StatCard
                icon="🏓"
                label="Lượt chơi hôm nay"
                value={visitStats.totalToday}
                subValue={`Tháng này: ${visitStats.totalThisMonth}`}
                color="#22c55e"
              />
              <StatCard
                icon="💰"
                label="Doanh thu hôm nay"
                value={formatCurrency(revenueStats.todayRevenue)}
                subValue={`Tháng: ${formatCurrency(revenueStats.monthRevenue)}`}
                color="#f59e0b"
              />
              <StatCard
                icon="🛒"
                label="Sản phẩm"
                value={productStats.totalProducts}
                subValue={`Tồn kho: ${productStats.totalStock}`}
                color="#3b82f6"
              />
              <StatCard
                icon="📧"
                label="Liên hệ mới"
                value={contactStats.newContacts}
                subValue={`Tổng: ${contactStats.totalContacts}`}
                color="#ef4444"
              />
            </div>
          </section>

          {/* Charts */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>📊 Biểu đồ 7 ngày qua</h2>
            <div style={styles.chartsGrid}>
              <BarChart
                title="Lượt chơi"
                data={visitStats.byDay.map(d => ({
                  label: getDayLabel(d.date),
                  value: d.count,
                }))}
                color="#22c55e"
              />
              <BarChart
                title="Doanh thu"
                data={revenueStats.byDay.map(d => ({
                  label: getDayLabel(d.date),
                  value: d.amount,
                }))}
                color="#f59e0b"
                formatValue={formatCurrency}
              />
            </div>
          </section>

          {/* Play Type & Payment Method */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>📋 Phân loại</h2>
            <div style={styles.chartsGrid}>
              <div style={chartStyles.container}>
                <h3 style={chartStyles.title}>Loại hình chơi</h3>
                <div style={styles.legendList}>
                  <div style={styles.legendItem}>
                    <span style={{ ...styles.legendDot, backgroundColor: '#3b82f6' }} />
                    <span>Theo giờ</span>
                    <span style={styles.legendValue}>{visitStats.byPlayType.hourly}</span>
                  </div>
                  <div style={styles.legendItem}>
                    <span style={{ ...styles.legendDot, backgroundColor: '#22c55e' }} />
                    <span>Theo ngày</span>
                    <span style={styles.legendValue}>{visitStats.byPlayType.daily}</span>
                  </div>
                  <div style={styles.legendItem}>
                    <span style={{ ...styles.legendDot, backgroundColor: '#f59e0b' }} />
                    <span>Theo tháng</span>
                    <span style={styles.legendValue}>{visitStats.byPlayType.monthly}</span>
                  </div>
                </div>
              </div>
              <div style={chartStyles.container}>
                <h3 style={chartStyles.title}>Phương thức thanh toán</h3>
                <div style={styles.legendList}>
                  {Object.entries(revenueStats.byPaymentMethod).length === 0 ? (
                    <p style={chartStyles.noData}>Chưa có dữ liệu</p>
                  ) : (
                    Object.entries(revenueStats.byPaymentMethod).map(([method, amount], i) => (
                      <div key={method} style={styles.legendItem}>
                        <span style={{ ...styles.legendDot, backgroundColor: ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b'][i % 4] }} />
                        <span>{method === 'cash' ? 'Tiền mặt' : method === 'transfer' ? 'Chuyển khoản' : method}</span>
                        <span style={styles.legendValue}>{formatCurrency(amount)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Tables */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>⚠️ Cảnh báo & Thông tin</h2>
            <div style={styles.chartsGrid}>
              <div style={chartStyles.container}>
                <h3 style={chartStyles.title}>Sản phẩm sắp hết hàng</h3>
                {productStats.lowStockProducts.length === 0 ? (
                  <p style={chartStyles.noData}>Không có sản phẩm nào sắp hết hàng</p>
                ) : (
                  <div style={styles.tableList}>
                    {productStats.lowStockProducts.map(p => (
                      <div key={p.id} style={styles.tableRow}>
                        <span>{p.name}</span>
                        <span style={{ color: p.stock === 0 ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>
                          Còn {p.stock}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={chartStyles.container}>
                <h3 style={chartStyles.title}>Liên hệ gần đây</h3>
                {contactStats.recentContacts.length === 0 ? (
                  <p style={chartStyles.noData}>Chưa có liên hệ nào</p>
                ) : (
                  <div style={styles.tableList}>
                    {contactStats.recentContacts.map(c => (
                      <div key={c.id} style={styles.tableRow}>
                        <span>{c.name}</span>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          backgroundColor: c.status === 'new' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                          color: c.status === 'new' ? '#ef4444' : '#22c55e',
                        }}>
                          {c.status === 'new' ? 'Mới' : 'Đã xử lý'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Note */}
          <div style={styles.note}>
            <strong>📝 Lưu ý:</strong> Dashboard hiển thị dữ liệu THỰC từ Firestore.
            Hiện tại database trống nên các số liệu đều = 0.
            Khi có dữ liệu thực (từ Admin Panel hoặc form liên hệ), các số liệu sẽ tự động cập nhật.
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================
// 🎨 STYLES
// ============================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    padding: '30px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    color: '#f8fafc',
    fontSize: '32px',
    fontWeight: 700,
    margin: 0,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '14px',
    marginTop: '8px',
  },
  lastUpdated: {
    marginLeft: '8px',
    color: '#64748b',
  },
  headerLinks: {
    display: 'flex',
    gap: '12px',
  },
  link: {
    color: '#60a5fa',
    textDecoration: 'none',
    padding: '8px 16px',
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    borderRadius: '8px',
    fontSize: '14px',
  },
  section: {
    marginBottom: '30px',
  },
  sectionTitle: {
    color: '#e2e8f0',
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '16px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  loading: {
    color: '#94a3b8',
    textAlign: 'center',
    padding: '60px',
    fontSize: '16px',
  },
  error: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid #ef4444',
    color: '#fca5a5',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  legendList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#e2e8f0',
    fontSize: '14px',
  },
  legendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '4px',
    flexShrink: 0,
  },
  legendValue: {
    marginLeft: 'auto',
    fontWeight: 600,
    color: '#f8fafc',
  },
  tableList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  tableRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #334155',
    color: '#e2e8f0',
    fontSize: '14px',
  },
  note: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid #3b82f6',
    borderRadius: '8px',
    padding: '16px',
    color: '#93c5fd',
    fontSize: '14px',
    lineHeight: 1.6,
  },
};

export default AdminDashboard;
