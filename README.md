# 🏓 CLB Bóng Bàn Lê Quý Đôn - Website & Management System

**Table Tennis Club Management System with E-commerce**

A complete web application for managing a table tennis club including member management, coach scheduling, event management, and an integrated shop system.

---

## 📋 Table of Contents

- [System Requirements](#system-requirements)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Admin Access](#admin-access)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🖥️ System Requirements

Before starting, ensure you have these installed:

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v7.0.0 or higher (comes with Node.js)
- **PostgreSQL**: v13 or higher ([Download](https://www.postgresql.org/download/))
- **Git**: For version control (optional)

### Verify Installation:
```bash
node --version   # Should show v18.0.0 or higher
npm --version    # Should show v7.0.0 or higher
psql --version   # Should show PostgreSQL 13 or higher
```

---

## 🚀 Quick Start

### 1. Install PostgreSQL

**Windows:**
1. Download PostgreSQL installer from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer, use default port `5432`
3. **IMPORTANT:** Remember the password you set for the `postgres` user

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

---

### 2. Clone/Copy Project

If you have the code:
```bash
cd path/to/project-folder
```

---

### 3. Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file (copy from example)
cp .env.example .env

# Edit .env file and set your PostgreSQL password
# On Windows: notepad .env
# On Mac/Linux: nano .env

# Create database
psql -U postgres -c "CREATE DATABASE clb_bongban;"

# Run database migrations
npm run db:migrate

# Create admin user (username: admin, password: admin123)
node src/database/create-admin.js

# Start backend server
npm run dev
```

**Backend should now be running on:** `http://localhost:3000`

---

### 4. Setup Frontend

Open a **NEW terminal window** (keep backend running):

```bash
# Go back to project root
cd ..

# Install dependencies
npm install

# Start frontend dev server
npm run dev
```

**Frontend should now be running on:** `http://localhost:5173`

---

## 📁 Project Structure

```
clb-lqd/
├── backend/                    # Backend API Server
│   ├── src/
│   │   ├── config/            # Database & app configuration
│   │   ├── controllers/       # Request handlers
│   │   ├── database/          # Migration & seed scripts
│   │   ├── middlewares/       # Auth & validation middleware
│   │   ├── models/            # Database models
│   │   ├── routes/            # API endpoints
│   │   ├── utils/             # Helper functions
│   │   ├── app.js            # Express app setup
│   │   └── server.js         # Server entry point
│   ├── .env                   # Environment variables (DO NOT COMMIT)
│   ├── .env.example          # Example environment variables
│   └── package.json
│
├── components/                # React components
├── pages/                     # Page components
├── services/                  # API service layer
├── styles/                    # CSS stylesheets
├── public/                    # Static assets
├── App.tsx                    # Main app component
├── index.tsx                  # App entry point
├── index.html                # HTML template
├── vite.config.ts            # Vite configuration
└── package.json              # Frontend dependencies
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
# Database - PostgreSQL connection
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clb_bongban
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE

# Server
PORT=3000
NODE_ENV=development

# Security - CHANGE THESE IN PRODUCTION
JWT_SECRET=your_secret_key_here
SESSION_SECRET=your_session_secret_here

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Frontend (`.env` - Optional)

```env
# Optional: Gemini API for AI features
GEMINI_API_KEY=your_gemini_api_key
```

---

## 🗄️ Database Setup

### Automatic Setup (Recommended)

```bash
cd backend

# Create database
psql -U postgres -c "CREATE DATABASE clb_bongban;"

# Run all migrations
npm run db:migrate

# Create admin user
node src/database/create-admin.js
```

### Manual Setup

If automatic setup fails:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE clb_bongban;

# Exit psql
\q

# Run schema
psql -U postgres -d clb_bongban -f src/database/schema.sql

# Run shop migration
psql -U postgres -d clb_bongban -f src/database/shop_migration.sql

# Create admin
node src/database/create-admin.js
```

---

## 🎯 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server runs on: `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Website runs on: `http://localhost:5173`

### Production Build

```bash
# Build frontend
npm run build

# Preview production build
npm run preview

# Run backend in production
cd backend
npm start
```

---

## 👤 Admin Access

After setup, access the admin panel:

- **URL:** `http://localhost:5173/admin`
- **Username:** `admin`
- **Password:** `admin123`

**⚠️ IMPORTANT:** Change the admin password in production!

To change password:
```bash
cd backend
# Edit src/database/update-password.js with new password
node src/database/update-password.js
```

---

## 🌐 Deployment

### Deploy to Netlify (Frontend)

1. Connect your Git repository to Netlify
2. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Add environment variables in Netlify dashboard
4. Deploy!

### Deploy Backend (Render.com / Railway / Heroku)

1. Create new web service
2. Connect repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables
6. Set up PostgreSQL database  
7. Deploy!

---

## 🔧 Troubleshooting

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error

**Error:** `Failed to connect to database`

**Check:**
1. PostgreSQL is running: `pg_isready`
2. Database exists: `psql -U postgres -l`
3. Credentials in `.env` are correct
4. Port 5432 is not blocked

### Cannot Login to Admin

**Solution:**
```bash
cd backend
node src/database/create-admin.js
```

### Frontend Not Loading

1. Clear browser cache (Ctrl+Shift+Del)
2. Check if backend is running on port 3000
3. Verify `services/api.ts` has correct API URL
4. Hard refresh: Ctrl+Shift+R

### Module Not Found Errors

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd ..
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/coaches` - List all coaches
- `GET /api/schedule` - Training schedule
- `GET /api/events` - Events list
- `GET /api/gallery` - Gallery images
- `GET /api/shop/products` - Shop products
- `POST /api/shop/orders` - Create order
- `POST /api/contact` - Submit contact form

### Protected Endpoints (Require Authentication)
- `POST /api/auth/login` - Admin login
- `GET /api/members` - Members management
- `GET /api/payments` - Payment records
- `GET /api/contact` - Contact forms
- `GET /api/shop/admin/*` - Shop management

---

## 🛠️ Tech Stack

### Frontend
- React 19.2
- TypeScript 5.8
- Vite 6.2
- React Router 7.10
- Recharts (Analytics)

### Backend
- Node.js 18+
- Express 4.18
- PostgreSQL 13+
- JWT Authentication
- bcryptjs (Password hashing)

---

## 📝 Scripts Reference

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend
```bash
npm start             # Start production server
npm run dev          # Start with nodemon (auto-reload)
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed sample data (if available)
npm run db:reset     # Reset database (if available)
```

---

## 🤝 Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review console errors in browser/terminal
3. Check database connection and credentials
4. Ensure all dependencies are installed

---

## 📄 License

Private project - All rights reserved

**Author:** TNDUCK <tunhanduc2007@gmail.com>

---

## ✅ Checklist for New Machine Setup

- [ ] Node.js v18+ installed
- [ ] PostgreSQL installed and running
- [ ] Database `clb_bongban` created
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend `.env` file created and configured
- [ ] Migrations run (`npm run db:migrate`)
- [ ] Admin user created (`node src/database/create-admin.js`)
- [ ] Backend server started (`cd backend && npm run dev`)
- [ ] Frontend server started (`npm run dev`)
- [ ] Can access website at `http://localhost:5173`
- [ ] Can login to admin at `http://localhost:5173/admin`

---

**🎉 Happy coding!**
