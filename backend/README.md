# CLB Bóng Bàn Lê Quý Đôn - Backend API

Backend Node.js + PostgreSQL cho website CLB Bóng Bàn Lê Quý Đôn.

## 📋 Yêu cầu hệ thống

- **Node.js**: >= 18.0.0
- **PostgreSQL**: >= 14.0
- **npm**: >= 9.0.0

## 🚀 Cài đặt & Chạy

### 1. Cài đặt PostgreSQL

**Windows:**
```bash
# Download từ https://www.postgresql.org/download/windows/
# Sau khi cài, tạo database:
createdb clb_bongban_lqd
```

**Mac:**
```bash
brew install postgresql@14
brew services start postgresql@14
createdb clb_bongban_lqd
```

### 2. Clone & cài dependencies

```bash
cd backend
npm install
```

### 3. Cấu hình môi trường

```bash
# Copy file mẫu
cp .env.example .env

# Chỉnh sửa .env với thông tin database của bạn
```

Nội dung file `.env`:
```env
PORT=3001
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clb_bongban_lqd
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_key_at_least_32_chars
JWT_EXPIRES_IN=7d

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@LQD2024

# Frontend
FRONTEND_URL=http://localhost:5173
```

### 4. Tạo database schema

```bash
npm run db:migrate
```

### 5. Seed dữ liệu mẫu (tùy chọn)

```bash
npm run db:seed
```

### 6. Chạy server

```bash
# Development (với hot reload)
npm run dev

# Production
npm start
```

Server sẽ chạy tại: **http://localhost:3001**

## 📚 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/auth/login` | Đăng nhập admin | ❌ |
| GET | `/api/auth/me` | Lấy thông tin admin | ✅ |
| POST | `/api/auth/change-password` | Đổi mật khẩu | ✅ |

### 👥 Members (Học viên)
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/members` | Danh sách học viên | ✅ Admin |
| GET | `/api/members/:id` | Chi tiết học viên | ✅ Admin |
| POST | `/api/members` | Thêm học viên | ✅ Admin |
| PUT | `/api/members/:id` | Cập nhật học viên | ✅ Admin |
| DELETE | `/api/members/:id` | Xóa học viên | ✅ Admin |
| GET | `/api/members/stats` | Thống kê học viên | ✅ Admin |

### 🏓 Coaches (HLV)
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/coaches` | Danh sách HLV | ❌ Public |
| GET | `/api/coaches/:id` | Chi tiết HLV | ❌ Public |
| POST | `/api/coaches` | Thêm HLV | ✅ Admin |
| PUT | `/api/coaches/:id` | Cập nhật HLV | ✅ Admin |
| DELETE | `/api/coaches/:id` | Xóa HLV | ✅ Admin |

### 📅 Schedule (Lịch tập)
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/schedule` | Lịch tuần | ❌ Public |
| GET | `/api/schedule/day/:day` | Lịch theo ngày | ❌ Public |
| GET | `/api/schedule/coach/:id` | Lịch theo HLV | ❌ Public |
| POST | `/api/schedule` | Thêm buổi tập | ✅ Admin |
| PUT | `/api/schedule/:id` | Cập nhật | ✅ Admin |
| DELETE | `/api/schedule/:id` | Xóa | ✅ Admin |

### 💰 Payments (Thanh toán)
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/payments` | Lịch sử thanh toán | ✅ Admin |
| POST | `/api/payments` | Ghi nhận thanh toán | ✅ Admin |
| GET | `/api/payments/stats` | Thống kê doanh thu | ✅ Admin |

### 🏆 Events (Sự kiện)
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/events` | Danh sách sự kiện | ❌ Public |
| POST | `/api/events` | Thêm sự kiện | ✅ Admin |
| PUT | `/api/events/:id` | Cập nhật | ✅ Admin |

### 🖼️ Gallery (Hình ảnh)
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/gallery` | Thư viện ảnh | ❌ Public |
| GET | `/api/gallery/featured` | Ảnh nổi bật | ❌ Public |
| POST | `/api/gallery` | Thêm ảnh | ✅ Admin |

### 📧 Contact (Liên hệ)
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/contact` | Gửi form liên hệ | ❌ Public |
| GET | `/api/contact` | Danh sách liên hệ | ✅ Admin |

## 🔒 Authentication

Sử dụng JWT Token trong header:
```
Authorization: Bearer <token>
```

### Login Example
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "Admin@LQD2024"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "...",
      "username": "admin",
      "role": "super_admin"
    }
  }
}
```

## 📁 Cấu trúc thư mục

```
backend/
├── src/
│   ├── config/
│   │   └── database.js      # PostgreSQL connection
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── member.controller.js
│   │   ├── coach.controller.js
│   │   ├── schedule.controller.js
│   │   └── payment.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js      # JWT verification
│   │   └── validation.middleware.js
│   ├── models/
│   │   ├── admin.model.js
│   │   ├── member.model.js
│   │   ├── coach.model.js
│   │   ├── schedule.model.js
│   │   └── payment.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── member.routes.js
│   │   ├── coach.routes.js
│   │   ├── schedule.routes.js
│   │   ├── payment.routes.js
│   │   ├── event.routes.js
│   │   ├── gallery.routes.js
│   │   └── contact.routes.js
│   ├── database/
│   │   ├── schema.sql       # Database schema
│   │   ├── seed.sql         # Seed data
│   │   ├── migrate.js       # Migration script
│   │   └── seed.js          # Seed script
│   ├── utils/
│   │   └── logger.js        # Winston logger
│   ├── app.js               # Express app config
│   └── server.js            # Server entry point
├── logs/                    # Log files
├── .env.example             # Environment template
├── package.json
└── README.md
```

## 🛡️ Security

- **Helmet**: Security headers
- **CORS**: Cross-origin control
- **Rate Limiting**: 100 requests/15min
- **Input Validation**: express-validator
- **SQL Injection Prevention**: Parameterized queries
- **Password Hashing**: bcryptjs

## 📊 Database Schema

Xem file `src/database/schema.sql` để biết chi tiết các bảng.

## 🔧 Scripts

```bash
npm run dev          # Development server
npm start            # Production server
npm run db:migrate   # Create tables
npm run db:seed      # Seed data
npm run db:reset     # Reset database
```

## 📝 License

© 2024 CLB Bóng Bàn Lê Quý Đôn
