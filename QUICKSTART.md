# ⚡ QUICK START - 3 MINUTES TO RUNNING

**For users who just copied this project from USB or cloned from Git.**

---

## 🚀 FASTEST SETUP (Windows)

```powershell
# 1. Open PowerShell in project folder
.\setup-windows.ps1

# 2. In NEW terminal:
cd backend
npm run dev

# 3. In ANOTHER NEW terminal:
npm run dev

# Done! Go to: http://localhost:5173
```

---

## 🚀 FASTEST SETUP (Mac/Linux)

```bash
# 1. Make script executable
chmod +x setup-unix.sh

# 2. Run setup
./setup-unix.sh

# 3. In NEW terminal:
cd backend
npm run dev

# 4. In ANOTHER NEW terminal:
npm run dev

# Done! Go to: http://localhost:5173
```

---

## 🔧 MANUAL SETUP (If Scripts Don't Work)

### Prerequisites
- Node.js 18+ installed
- PostgreSQL installed

### Steps

```bash
# 1. Backend Setup
cd backend
npm install
copy .env.example .env
# Edit .env and set DB_PASSWORD=your_postgres_password

# 2. Database
psql -U postgres -c "CREATE DATABASE clb_bongban;"
npm run db:migrate
node src/database/create-admin.js

# 3. Start Backend
npm run dev
# Should see: Server running on http://localhost:3000

# 4. Frontend Setup (NEW TERMINAL)
cd ..
npm install

# 5. Start Frontend
npm run dev
# Should see: Local: http://localhost:5173
```

---

## 🌐 OPEN IN BROWSER

- **Website:** http://localhost:5173
- **Admin Panel:** http://localhost:5173/admin
  - Username: `admin`
  - Password: `admin123`

---

## ❌ PROBLEMS?

### "PostgreSQL not found"
- Install from: https://www.postgresql.org/download/
- Windows: Add to PATH or use full path
- Mac: `brew install postgresql`

### "Port already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <number> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### "Cannot connect to database"
1. Check PostgreSQL is running
2. Verify password in `backend/.env`
3. Run: `psql -U postgres` to test connection

### "npm install fails"
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 NEED MORE HELP?

- **Full Guide:** See `README.md`
- **Deployment:** See `DEPLOYMENT.md`
- **All Fixes:** See `FIXES.md`

---

**That's it! You're ready to code! 🎉**
