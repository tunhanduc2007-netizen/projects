# 🚀 DEPLOYMENT GUIDE

Complete guide for deploying CLB Bóng Bàn project to production.

---

## 📋 Table of Contents
- [Frontend Deployment (Netlify)](#frontend-deployment-netlify)
- [Backend Deployment (Render/Railway)](#backend-deployment-render)
- [Database Setup (Production)](#database-setup-production)
- [Environment Variables](#environment-variables-production)
- [Post-Deployment Checklist](#post-deployment-checklist)

---

## 🌐 Frontend Deployment (Netlify)

### Option 1: Deploy via Git (Recommended)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   
3. **Configure build settings**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Base directory:** (leave empty)

4. **Add environment variables** (Optional)
   - Go to Site settings → Environment variables
   - Add: `VITE_API_URL=https://your-backend-url.com/api`

5. **Deploy!**
   - Click "Deploy site"
   - Wait for build to complete
   - Your site will be live at `https://your-site.netlify.app`

### Option 2: Manual Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Custom Domain Setup

1. Go to Domain settings in Netlify
2. Add custom domain (e.g., clbbongbanlequydon.com)
3. Update DNS records as instructed
4. Enable HTTPS (automatic)

---

## 🔧 Backend Deployment (Render)

### 1. Prepare for Deployment

**Update `package.json` in backend folder:**
```json
{
  "scripts": {
    "start": "node src/server.js",
    "build": "npm install"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 2. Deploy to Render.com

1. **Create account** at [render.com](https://render.com)

2. **Create PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Name: `clb-bongban-db`
   - Plan: Free tier
   - Create database
   - **SAVE** the "Internal Database URL" and "External Database URL"

3. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Select repository
   
4. **Configure service**
   - **Name:** `clb-bongban-api`
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

5. **Add Environment Variables**
   Click "Environment" tab and add:
   
   ```env
   NODE_ENV=production
   PORT=3000
   
   # Database (use Internal Database URL from step 2)
   DB_HOST=<from-database-url>
   DB_PORT=5432
   DB_NAME=<from-database-url>
   DB_USER=<from-database-url>
   DB_PASSWORD=<from-database-url>
   
   # Security - CHANGE THESE!
   JWT_SECRET=<generate-strong-random-string>
   SESSION_SECRET=<generate-strong-random-string>
   
   # CORS - Your frontend URL
   CORS_ORIGIN=https://your-site.netlify.app
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Your API will be at: `https://your-app.onrender.com`

### 3. Setup Production Database

After deployment, run migrations:

```bash
# Get shell access to your Render service
# Go to your service → Shell tab

# Or use database connection string
psql <your-external-database-url>

# Run migrations manually
\i src/database/schema.sql
\i src/database/shop_migration.sql
```

**OR** add to your `package.json`:
```json
{
  "scripts": {
    "start": "npm run db:migrate && node src/server.js",
    "db:migrate": "node src/database/migrate.js"
  }
}
```

---

## 🗄️ Database Setup (Production)

### Using Render PostgreSQL

1. **Created during backend setup** (see above)
2. **Connection Info** found in:
   - Render Dashboard → Your Database → Connection Info
3. **Run Migrations:**
   ```bash
   # Use External Database URL for remote access
   psql <external-database-url> -f backend/src/database/schema.sql
   psql <external-database-url> -f backend/src/database/shop_migration.sql
   ```

4. **Create Admin User:**
   ```bash
   # SSH into Render service or run locally with prod DB
   node backend/src/database/create-admin.js
   ```

### Alternative: External PostgreSQL

If using external PostgreSQL (AWS RDS, DigitalOcean, etc.):

1. Create database: `clb_bongban`
2. Get connection credentials
3. Update environment variables
4. Run migrations

---

## 🔐 Environment Variables (Production)

### Backend (.env in Render)

```env
NODE_ENV=production
PORT=3000

# Database
DB_HOST=dpg-xxxx-a.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=clb_bongban_xxxx
DB_USER=clb_bongban_xxxx_user
DB_PASSWORD=<strong-random-password>

# Security - MUST CHANGE!
JWT_SECRET=<generate-64-char-random-string>
SESSION_SECRET=<generate-64-char-random-string>

# CORS
CORS_ORIGIN=https://clbbongbanlequydon.netlify.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env in Netlify)

```env
VITE_API_URL=https://clb-bongban-api.onrender.com/api
```

**Generate secure secrets:**
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or online
https://randomkeygen.com/
```

---

## 🔗 Connect Frontend to Backend

After both are deployed:

1. **Update Frontend Environment Variable**
   - Netlify → Site settings → Environment variables
   - Add/Update: `VITE_API_URL=https://your-backend.onrender.com/api`
   - Trigger redeploy

2. **Update Backend CORS**
   - Render → Environment
   - Update: `CORS_ORIGIN=https://your-frontend.netlify.app`
   - Service will auto-redeploy

3. **Update API URL in Code** (if not using env var)
   - Edit `services/api.ts`
   - Change production URL to your backend URL
   - Commit and push

---

## ✅ Post-Deployment Checklist

- [ ] Frontend is accessible at production URL
- [ ] Backend API responds at `/api/health`
- [ ] Database migrations completed
- [ ] Admin user created
- [ ] Can login to admin panel
- [ ] CORS is properly configured
- [ ] Environment variables are set (no default passwords)
- [ ] SSL/HTTPS is enabled
- [ ] Custom domain configured (if applicable)
- [ ] Error monitoring set up (optional)
- [ ] Backups configured for database

---

## 🧪 Testing Production

```bash
# Test backend health
curl https://your-backend.onrender.com/api/health

# Test API endpoints
curl https://your-backend.onrender.com/api/coaches
curl https://your-backend.onrender.com/api/events

# Test frontend
# Open https://your-site.netlify.app in browser
# Try logging into admin panel
```

---

## 🔄 Continuous Deployment

Both Netlify and Render support automatic deployments:

**Netlify:**
- Automatically deploys on push to main branch
- Configure branch in Site settings

**Render:**
- Automatically deploys on push to main branch
- Configure in service settings

---

## 🛠️ Common Issues

### Backend not starting

**Check logs in Render:**
- Render Dashboard → Your Service → Logs
- Look for error messages
- Verify environment variables

### Database connection failed

- Verify database URL is correct
- Check database is running
- Verify firewall rules allow connection
- Ensure database credentials are correct

### CORS errors

```
Access-Control-Allow-Origin error
```

**Fix:**
- Update `CORS_ORIGIN` in backend environment variables
- Must match exact frontend URL (including https://)
- Redeploy backend

### Build failures

**Netlify:**
- Check build logs
- Verify all dependencies in package.json
- Ensure TypeScript compiles without errors

**Render:**
- Check deploy logs
- Verify `npm install` completes
- Check Node.js version compatibility

---

## 📊 Monitoring & Maintenance

### Logs

**Render:**
- Dashboard → Service → Logs (real-time)
- Export logs for analysis

**Netlify:**
- Dashboard → Deploys → Deploy log
- Function logs (if using serverless functions)

### Database Backups

**Render PostgreSQL:**
- Automatic daily backups (retained 7 days on free tier)
- Manual backups: pg_dump command

```bash
# Manual backup
pg_dump <database-url> > backup.sql

# Restore
psql <database-url> < backup.sql
```

### Performance Monitoring

Consider adding:
- Sentry (error tracking)
- LogRocket (session replay)
- Google Analytics (visitor tracking)

---

## 🔒 Security Best Practices

1. **Never commit .env files**
   - Already in .gitignore
   - Double-check before pushing

2. **Use strong secrets**
   - JWT_SECRET: 64+ characters
   - SESSION_SECRET: 64+ characters
   - Generate with crypto.randomBytes

3. **Change default admin password**
   ```bash
   # After deployment
   node backend/src/database/update-password.js
   ```

4. **Enable rate limiting**
   - Already configured
   - Adjust limits in .env

5. **Keep dependencies updated**
   ```bash
   npm audit
   npm update
   ```

---

## 📞 Support

If you encounter issues:
1. Check deployment logs
2. Verify environment variables
3. Test each component separately
4. Review this guide
5. Check service status pages:
   - [Netlify Status](https://netlifystatus.com)
   - [Render Status](https://status.render.com)

---

**🎉 Deployment complete! Your app is now live in production.**
