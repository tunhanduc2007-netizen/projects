# 🔥 HƯỚNG DẪN SỬ DỤNG DATABASE SYSTEM

## 📋 MỤC LỤC

1. [Cấu trúc files](#1-cấu-trúc-files)
2. [Authentication](#2-authentication)
3. [CRUD Operations](#3-crud-operations)
4. [Toast Notifications](#4-toast-notifications)
5. [Loading States](#5-loading-states)
6. [Realtime Data](#6-realtime-data)
7. [Validation](#7-validation)
8. [Permission Check](#8-permission-check)
9. [Transaction](#9-transaction)
10. [Ví dụ thực tế](#10-ví-dụ-thực-tế)

---

## 1. Cấu trúc files

```
firebase/
├── config.ts              # Cấu hình Firebase
├── index.ts               # Main exports
├── types/
│   └── database.ts        # TypeScript types cho tất cả entities
├── services/
│   ├── api.ts             # API functions (CRUD, Transaction)
│   ├── auth.ts            # Authentication service
│   └── validation.ts      # Validation & Sanitization
└── hooks/
    └── index.ts           # React hooks

components/ui/
├── ToastContainer.tsx     # Toast notifications
└── Loading.tsx            # Loading animations
```

---

## 2. Authentication

### 2.1. Basic Usage

```tsx
import { useAuth } from './firebase/hooks';

function LoginPage() {
  const { 
    user,           // Current user (null if not logged in)
    loading,        // Loading state
    error,          // Error message
    login,          // Login function
    register,       // Register function
    logout,         // Logout function
    resetPassword,  // Reset password
    isAdmin,        // true if user is admin
    isStaff,        // true if user is admin or staff
    isMember,       // true if user is member
    hasPermission,  // Check specific permission
  } = useAuth();

  // Login
  const handleLogin = async () => {
    const result = await login('email@example.com', 'password123');
    
    if (result.success) {
      console.log('Đăng nhập thành công!', result.data);
    } else {
      console.error('Lỗi:', result.error?.message);
    }
  };

  // Register
  const handleRegister = async () => {
    const result = await register(
      'email@example.com',
      'password123',
      'Nguyễn Văn A',
      '0912345678'
    );
    
    if (result.success) {
      console.log('Đăng ký thành công!');
    }
  };

  // Logout
  const handleLogout = async () => {
    await logout();
  };

  // Reset password
  const handleResetPassword = async () => {
    await resetPassword('email@example.com');
    // Email will be sent
  };

  return (
    <div>
      {loading && <p>Đang tải...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {user ? (
        <div>
          <p>Xin chào, {user.displayName}</p>
          <p>Role: {user.role}</p>
          <button onClick={handleLogout}>Đăng xuất</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Đăng nhập</button>
      )}
    </div>
  );
}
```

### 2.2. Protected Route

```tsx
import { useAuth } from './firebase/hooks';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredRole = 'member' }) {
  const { user, loading, isAdmin, isStaff } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check role
  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/unauthorized" />;
  }

  if (requiredRole === 'staff' && !isStaff) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}

// Usage
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminPanel />
    </ProtectedRoute>
  } 
/>
```

---

## 3. CRUD Operations

### 3.1. Users

```tsx
import { useUsers } from './firebase/hooks';

function UsersPage() {
  const { 
    data: users,      // Danh sách users
    loading,          // Loading state
    error,            // Error message
    refresh,          // Refresh data
    createUser,       // Tạo user mới
    updateUser,       // Cập nhật user
    deleteUser,       // Xóa user (soft delete)
  } = useUsers('admin'); // Pass current user role

  // Create
  const handleCreate = async () => {
    const result = await createUser({
      full_name: 'Nguyễn Văn A',
      email: 'nva@example.com',
      phone: '0912345678',
      role: 'member',
    });

    if (result.success) {
      console.log('Tạo thành công:', result.data);
    } else {
      console.error('Lỗi:', result.error);
    }
  };

  // Update
  const handleUpdate = async (userId: string) => {
    const result = await updateUser(userId, {
      full_name: 'Nguyễn Văn B',
    });

    if (result.success) {
      console.log('Cập nhật thành công');
    }
  };

  // Delete (soft delete)
  const handleDelete = async (userId: string) => {
    const result = await deleteUser(userId);

    if (result.success) {
      console.log('Đã xóa');
    }
  };

  return (
    <div>
      {loading && <p>Đang tải...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.full_name} - {user.email}
            <button onClick={() => handleUpdate(user.id)}>Sửa</button>
            <button onClick={() => handleDelete(user.id)}>Xóa</button>
          </li>
        ))}
      </ul>
      
      <button onClick={handleCreate}>Thêm User</button>
    </div>
  );
}
```

### 3.2. Visitors (Khách đến chơi)

```tsx
import { useVisitors } from './firebase/hooks';

function VisitorsPage() {
  const { 
    data: visitors,
    loading,
    createVisitor,
    todayVisitors,    // Khách hôm nay
    totalToday,       // Tổng số khách hôm nay
  } = useVisitors();

  const handleCreate = async () => {
    const result = await createVisitor({
      visitor_name: 'Trần Văn B',
      visitor_phone: '0987654321',
      visit_date: new Date(),
      check_in_time: new Date(),
      play_type: 'hourly',      // hourly | daily | monthly | yearly
      table_number: 5,
      price: 50000,             // 50,000 VND
      payment_method: 'cash',   // cash | transfer | momo | zalopay | card
      note: 'Khách VIP',
    });

    if (result.success) {
      console.log('Đã thêm khách:', result.data);
      // Payment record cũng được tạo tự động (transaction)
    }
  };

  return (
    <div>
      <h2>Khách hôm nay: {totalToday}</h2>
      
      <table>
        <thead>
          <tr>
            <th>Tên</th>
            <th>Giờ vào</th>
            <th>Bàn</th>
            <th>Giá</th>
            <th>Thanh toán</th>
          </tr>
        </thead>
        <tbody>
          {todayVisitors.map(v => (
            <tr key={v.id}>
              <td>{v.visitor_name}</td>
              <td>{v.check_in_time.toDate().toLocaleTimeString()}</td>
              <td>{v.table_number}</td>
              <td>{v.price.toLocaleString()} đ</td>
              <td>{v.payment_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <button onClick={handleCreate}>Thêm khách</button>
    </div>
  );
}
```

### 3.3. Payments (Thanh toán)

```tsx
import { usePayments } from './firebase/hooks';

function PaymentsPage() {
  const { 
    data: payments,
    loading,
    confirmPayment,   // Xác nhận thanh toán
    todayRevenue,     // Doanh thu hôm nay
    pendingCount,     // Số thanh toán đang chờ
  } = usePayments();

  const handleConfirm = async (paymentId: string) => {
    const result = await confirmPayment(paymentId, 'TXN123456');
    
    if (result.success) {
      console.log('Đã xác nhận thanh toán');
      // Visitor/Order liên quan cũng được cập nhật (transaction)
    }
  };

  return (
    <div>
      <h2>Doanh thu hôm nay: {todayRevenue.toLocaleString()} đ</h2>
      <p>Đang chờ: {pendingCount} giao dịch</p>
      
      {payments.map(p => (
        <div key={p.id}>
          <span>{p.amount.toLocaleString()} đ</span>
          <span>{p.payment_status}</span>
          {p.payment_status === 'pending' && (
            <button onClick={() => handleConfirm(p.id)}>
              Xác nhận
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

### 3.4. Products (Sản phẩm)

```tsx
import { useProducts } from './firebase/hooks';

function ProductsPage() {
  const { 
    data: products,
    loading,
    createProduct,
    getByCategory,      // Lọc theo category
    featuredProducts,   // Sản phẩm nổi bật
  } = useProducts();

  const handleCreate = async () => {
    const result = await createProduct({
      name: 'Vợt Butterfly Viscaria',
      description: 'Vợt chuyên nghiệp cao cấp',
      price: 2500000,
      original_price: 3000000,
      stock: 10,
      category: 'racket',  // racket | rubber | blade | ball | table | accessory | clothing | other
      brand: 'Butterfly',
      sku: 'BTF-VIS-001',
      image_url: '/products/viscaria.jpg',
      featured: true,
    });

    if (result.success) {
      console.log('Đã thêm sản phẩm');
    }
  };

  // Lọc theo category
  const rackets = getByCategory('racket');
  const rubbers = getByCategory('rubber');

  return (
    <div>
      <h2>Sản phẩm nổi bật</h2>
      {featuredProducts.map(p => (
        <div key={p.id}>{p.name} - {p.price.toLocaleString()} đ</div>
      ))}
      
      <h2>Vợt ({rackets.length})</h2>
      {rackets.map(p => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
}
```

### 3.5. Orders (Đơn hàng)

```tsx
import { useOrders, useAuth } from './firebase/hooks';

function OrdersPage() {
  const { user } = useAuth();
  const { 
    data: orders,
    loading,
    createOrder,
    updateStatus,
    cancelOrder,
    pendingOrders,
    myOrders,
  } = useOrders();

  const handleCreate = async () => {
    if (!user) return;

    const result = await createOrder({
      customer_name: 'Nguyễn Văn C',
      customer_phone: '0912345678',
      customer_email: 'nvc@example.com',
      shipping_address: '123 Đường ABC, Q1, TP.HCM',
      items: [
        { product_id: 'product-1', quantity: 2 },
        { product_id: 'product-2', quantity: 1 },
      ],
      shipping_fee: 30000,
      discount: 50000,
      payment_method: 'transfer',
      note: 'Giao giờ hành chính',
    }, user.uid);

    if (result.success) {
      console.log('Đã tạo đơn hàng:', result.data?.order_number);
      // Stock đã được trừ tự động (transaction)
      // Payment record đã được tạo
    }
  };

  // Cập nhật trạng thái
  const handleUpdateStatus = async (orderId: string) => {
    await updateStatus(orderId, 'shipping'); // pending | confirmed | processing | shipping | delivered | cancelled
  };

  // Hủy đơn
  const handleCancel = async (orderId: string) => {
    const result = await cancelOrder(orderId, 'Khách yêu cầu hủy');
    // Stock đã được hoàn lại (transaction)
  };

  return (
    <div>
      <h2>Đơn hàng đang chờ: {pendingOrders.length}</h2>
      
      {orders.map(order => (
        <div key={order.id}>
          <p>Mã: {order.order_number}</p>
          <p>Khách: {order.customer_name}</p>
          <p>Tổng: {order.total_price.toLocaleString()} đ</p>
          <p>Trạng thái: {order.order_status}</p>
          
          {order.order_status === 'pending' && (
            <>
              <button onClick={() => handleUpdateStatus(order.id)}>
                Xác nhận
              </button>
              <button onClick={() => handleCancel(order.id)}>
                Hủy
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
```

### 3.6. Contacts (Liên hệ - Form công khai)

```tsx
import { useContacts } from './firebase/hooks';

function ContactForm() {
  const { submitContact } = useContacts();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await submitContact({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      message: formData.message,
      contact_type: 'general', // general | support | feedback | partnership | complaint
    });

    if (result.success) {
      alert('Cảm ơn bạn đã liên hệ!');
      // Reset form
    } else {
      alert('Lỗi: ' + result.error?.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Họ tên *"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <input
        type="tel"
        placeholder="Số điện thoại *"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <textarea
        placeholder="Nội dung *"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        required
      />
      <button type="submit">Gửi</button>
    </form>
  );
}
```

---

## 4. Toast Notifications

```tsx
import { useToast } from './firebase/hooks';
import { ToastContainer } from './components/ui/ToastContainer';

function App() {
  const { 
    toasts,       // Danh sách toast hiện tại
    success,      // Hiển thị toast thành công
    error,        // Hiển thị toast lỗi
    warning,      // Hiển thị toast cảnh báo
    info,         // Hiển thị toast thông tin
    removeToast,  // Xóa toast
  } = useToast();

  const handleSave = async () => {
    try {
      // ... save logic
      success('Đã lưu thành công!');
    } catch (err) {
      error('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  return (
    <>
      {/* Toast container - đặt ở root */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <button onClick={handleSave}>Lưu</button>
      <button onClick={() => warning('Cảnh báo!')}>Warning</button>
      <button onClick={() => info('Thông tin')}>Info</button>
    </>
  );
}
```

---

## 5. Loading States

```tsx
import { 
  LoadingSpinner, 
  Skeleton, 
  CardSkeleton, 
  TableSkeleton,
  SuccessAnimation,
  ErrorAnimation,
} from './components/ui/Loading';

function ProductsPage() {
  const { data, loading, error } = useProducts();

  if (loading) {
    return (
      <div>
        {/* Loading spinner fullscreen */}
        <LoadingSpinner fullScreen text="Đang tải sản phẩm..." />
        
        {/* Hoặc skeleton */}
        <div style={{ display: 'grid', gap: 16 }}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        
        {/* Hoặc table skeleton */}
        <TableSkeleton rows={5} />
      </div>
    );
  }

  if (error) {
    return <ErrorAnimation message={error} />;
  }

  return (
    <div>
      {data.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

---

## 6. Realtime Data

Tất cả hooks đều có realtime subscription tự động:

```tsx
function Dashboard() {
  // Data tự động cập nhật khi có thay đổi từ server
  const { todayVisitors, totalToday } = useVisitors(new Date());
  const { pendingOrders } = useOrders();
  const { pendingCount, todayRevenue } = usePayments();
  const { newContacts } = useContacts();

  return (
    <div>
      <StatCard title="Khách hôm nay" value={totalToday} />
      <StatCard title="Đơn chờ xử lý" value={pendingOrders.length} />
      <StatCard title="Doanh thu" value={todayRevenue} />
      <StatCard title="Liên hệ mới" value={newContacts.length} />
    </div>
  );
}
```

### useDashboard Hook

```tsx
import { useDashboard } from './firebase/hooks';

function DashboardPage() {
  const { stats, loading, error, refresh } = useDashboard();

  // Stats tự động refresh mỗi 30 giây

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <p>Khách hôm nay: {stats?.totalVisitors}</p>
      <p>Doanh thu: {stats?.totalRevenue.toLocaleString()} đ</p>
      <p>Đơn hàng: {stats?.totalOrders}</p>
      <p>Đơn chờ: {stats?.pendingOrders}</p>
      <p>Liên hệ mới: {stats?.newContacts}</p>
      <p>Sản phẩm: {stats?.activeProducts}</p>
      
      <button onClick={refresh}>Làm mới</button>
    </div>
  );
}
```

---

## 7. Validation

### 7.1. Tự động validation trong hooks

Validation được tự động thực hiện khi gọi create/update:

```tsx
const handleCreate = async () => {
  const result = await createUser({
    full_name: 'A',           // Lỗi: quá ngắn
    email: 'invalid-email',   // Lỗi: sai format
    phone: '123',             // Lỗi: sai format VN
  });

  if (!result.success) {
    console.log(result.error);
    // {
    //   code: 'VALIDATION_ERROR',
    //   message: 'Dữ liệu không hợp lệ',
    //   details: {
    //     full_name: ['full_name phải có ít nhất 2 ký tự'],
    //     email: ['Email không hợp lệ'],
    //     phone: ['Số điện thoại không hợp lệ (VD: 0912345678)'],
    //   }
    // }
  }
};
```

### 7.2. Manual validation

```tsx
import { 
  validateUser, 
  validateOrder, 
  validateContact 
} from './firebase/services/validation';

const validation = validateUser({
  full_name: 'Nguyễn Văn A',
  email: 'nva@example.com',
  phone: '0912345678',
});

if (validation.valid) {
  console.log('Dữ liệu hợp lệ');
  console.log('Dữ liệu đã sanitize:', validation.sanitizedData);
} else {
  console.log('Lỗi:', validation.errors);
}
```

---

## 8. Permission Check

```tsx
import { useAuth } from './firebase/hooks';

function AdminButton() {
  const { user, hasPermission, isAdmin, isStaff } = useAuth();

  // Check role
  if (isAdmin) {
    return <button>Admin Panel</button>;
  }

  // Check specific permission
  if (hasPermission('orders', 'create')) {
    return <button>Tạo đơn hàng</button>;
  }

  if (hasPermission('products', 'delete')) {
    return <button>Xóa sản phẩm</button>;
  }

  return null;
}
```

### Permission Matrix

| Role | Resource | create | read | update | delete |
|------|----------|--------|------|--------|--------|
| admin | users | ✅ | ✅ | ✅ | ✅ |
| admin | visitors | ✅ | ✅ | ✅ | ✅ |
| admin | payments | ✅ | ✅ | ✅ | ✅ |
| admin | products | ✅ | ✅ | ✅ | ✅ |
| admin | orders | ✅ | ✅ | ✅ | ✅ |
| staff | users | ❌ | ✅ | ❌ | ❌ |
| staff | visitors | ✅ | ✅ | ✅ | ❌ |
| staff | payments | ✅ | ✅ | ✅ | ❌ |
| staff | products | ❌ | ✅ | ✅ | ❌ |
| staff | orders | ✅ | ✅ | ✅ | ❌ |
| member | orders | ✅ (own) | ✅ (own) | ❌ | ❌ |
| member | products | ❌ | ✅ | ❌ | ❌ |
| guest | products | ❌ | ✅ | ❌ | ❌ |
| guest | contacts | ✅ | ❌ | ❌ | ❌ |

---

## 9. Transaction

Các operations sau đây sử dụng transaction tự động:

### 9.1. Tạo Visitor

```tsx
// Khi tạo visitor, payment record cũng được tạo đồng thời
const result = await createVisitor({...});
// => visitor + payment được tạo trong cùng transaction
// => Nếu 1 trong 2 thất bại, cả 2 đều rollback
```

### 9.2. Tạo Order

```tsx
// Khi tạo order:
// 1. Kiểm tra stock của từng sản phẩm
// 2. Trừ stock
// 3. Tạo order
// 4. Tạo payment record
const result = await createOrder({...}, userId);
// => Tất cả trong 1 transaction
```

### 9.3. Xác nhận Payment

```tsx
// Khi xác nhận payment:
// 1. Update payment status
// 2. Update visitor/order payment status
const result = await confirmPayment(paymentId, transactionId);
```

### 9.4. Hủy Order

```tsx
// Khi hủy order:
// 1. Hoàn lại stock cho từng sản phẩm
// 2. Update order status
// 3. Update payment status
const result = await cancelOrder(orderId, 'Lý do hủy');
```

---

## 10. Ví dụ thực tế

### 10.1. Complete Admin Dashboard

```tsx
import React from 'react';
import { 
  useAuth, 
  useVisitors, 
  usePayments, 
  useOrders, 
  useContacts,
  useToast,
  useDashboard,
} from './firebase/hooks';
import { ToastContainer } from './components/ui/ToastContainer';
import { LoadingSpinner } from './components/ui/Loading';

function AdminDashboard() {
  const { user, isAdmin, logout } = useAuth();
  const { stats, loading: statsLoading } = useDashboard();
  const { todayVisitors, createVisitor } = useVisitors(new Date());
  const { pendingOrders, updateStatus } = useOrders();
  const { newContacts, markAsRead } = useContacts();
  const { toasts, success, error, removeToast } = useToast();

  if (!user || !isAdmin) {
    return <p>Không có quyền truy cập</p>;
  }

  const handleAddVisitor = async () => {
    const result = await createVisitor({
      visitor_name: 'Khách mới',
      visit_date: new Date(),
      check_in_time: new Date(),
      play_type: 'hourly',
      price: 50000,
      payment_method: 'cash',
    });

    if (result.success) {
      success('Đã thêm khách mới!');
    } else {
      error(result.error?.message || 'Lỗi');
    }
  };

  return (
    <div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <header>
        <h1>Admin Dashboard</h1>
        <p>Xin chào, {user.displayName}</p>
        <button onClick={logout}>Đăng xuất</button>
      </header>

      {statsLoading ? (
        <LoadingSpinner text="Đang tải thống kê..." />
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Khách hôm nay</h3>
            <p>{stats?.totalVisitors}</p>
          </div>
          <div className="stat-card">
            <h3>Doanh thu</h3>
            <p>{stats?.totalRevenue.toLocaleString()} đ</p>
          </div>
          <div className="stat-card">
            <h3>Đơn chờ</h3>
            <p>{stats?.pendingOrders}</p>
          </div>
          <div className="stat-card">
            <h3>Liên hệ mới</h3>
            <p>{stats?.newContacts}</p>
          </div>
        </div>
      )}

      <section>
        <h2>Khách hôm nay ({todayVisitors.length})</h2>
        <button onClick={handleAddVisitor}>+ Thêm khách</button>
        <table>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Giờ vào</th>
              <th>Bàn</th>
              <th>Giá</th>
            </tr>
          </thead>
          <tbody>
            {todayVisitors.map(v => (
              <tr key={v.id}>
                <td>{v.visitor_name}</td>
                <td>{v.check_in_time?.toDate?.().toLocaleTimeString()}</td>
                <td>{v.table_number || '-'}</td>
                <td>{v.price.toLocaleString()} đ</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Đơn hàng chờ xử lý ({pendingOrders.length})</h2>
        {pendingOrders.map(order => (
          <div key={order.id} className="order-card">
            <p><strong>{order.order_number}</strong></p>
            <p>{order.customer_name} - {order.customer_phone}</p>
            <p>{order.total_price.toLocaleString()} đ</p>
            <button onClick={() => updateStatus(order.id, 'confirmed')}>
              Xác nhận
            </button>
          </div>
        ))}
      </section>

      <section>
        <h2>Liên hệ mới ({newContacts.length})</h2>
        {newContacts.map(contact => (
          <div key={contact.id} className="contact-card">
            <p><strong>{contact.name}</strong> - {contact.phone}</p>
            <p>{contact.message}</p>
            <button onClick={() => markAsRead(contact.id)}>
              Đánh dấu đã đọc
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}

export default AdminDashboard;
```

---

## 📝 GHI CHÚ QUAN TRỌNG

1. **Firebase phải được khởi tạo** trước khi sử dụng hooks
2. **Realtime data** tự động cập nhật khi có thay đổi
3. **Validation** tự động thực hiện khi create/update
4. **Transaction** đảm bảo data consistency
5. **Soft delete** - dữ liệu không bị xóa hoàn toàn
6. **Audit log** ghi lại mọi thao tác

---

## 🔗 LINKS

- Firebase Console: https://console.firebase.google.com/project/clbbongbanlequydon
- Firestore Database: https://console.firebase.google.com/project/clbbongbanlequydon/firestore
