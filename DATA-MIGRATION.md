# 📦 DATA MIGRATION GUIDE

**How to transfer database from one machine to another**

---

## 🎯 SCENARIOS

### Scenario 1: You Have Access to Old Machine
✅ **Follow this guide to export and import data**

### Scenario 2: You Don't Have Access to Old Machine
❌ **Data cannot be recovered**  
⚠️ Start fresh with new data

---

## 📤 EXPORT DATA FROM OLD MACHINE

### Full Database Export (Recommended)

```bash
# Export ENTIRE database
pg_dump -U postgres -d clb_bongban > full_backup_$(date +%Y%m%d).sql

# Result: full_backup_20251220.sql
```

### Selective Export (Shop Orders Only)

```bash
# Export only shop-related tables
pg_dump -U postgres -d clb_bongban \
  -t shop_orders \
  -t shop_order_items \
  -t shop_payments \
  -t shop_products \
  -t shop_bank_accounts \
  > shop_backup_$(date +%Y%m%d).sql
```

### Export Specific Tables

```bash
# Orders only
pg_dump -U postgres -d clb_bongban -t shop_orders -t shop_order_items > orders_only.sql

# Members only
pg_dump -U postgres -d clb_bongban -t members -t payments > members_only.sql

# Events only
pg_dump -U postgres -d clb_bongban -t events -t gallery > events_only.sql
```

---

## 📥 IMPORT DATA TO NEW MACHINE

### Method 1: Full Restore

```bash
# On NEW machine, drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS clb_bongban;"
psql -U postgres -c "CREATE DATABASE clb_bongban;"

# Import full backup
psql -U postgres -d clb_bongban < full_backup_20251220.sql
```

### Method 2: Incremental Import (Recommended)

```bash
# Step 1: Create fresh database structure
cd backend
npm run db:migrate

# Step 2: Import ONLY the data (skip CREATE TABLE statements)
psql -U postgres -d clb_bongban < shop_backup_20251220.sql
```

### Method 3: Table-by-Table Import

```bash
# Import specific tables
psql -U postgres -d clb_bongban < orders_only.sql
psql -U postgres -d clb_bongban < members_only.sql
```

---

## 🪟 WINDOWS-SPECIFIC COMMANDS

### Export

```powershell
# Set password
$env:PGPASSWORD="your_postgres_password"

# Add psql to PATH
$env:Path += ";C:\Program Files\PostgreSQL\17\bin"

# Export full database
& 'C:\Program Files\PostgreSQL\17\bin\pg_dump.exe' -U postgres -d clb_bongban > full_backup.sql

# Export shop tables only
& 'C:\Program Files\PostgreSQL\17\bin\pg_dump.exe' -U postgres -d clb_bongban -t shop_orders -t shop_order_items -t shop_products > shop_backup.sql
```

### Import

```powershell
# Set password
$env:PGPASSWORD="your_postgres_password"

# Import
& 'C:\Program Files\PostgreSQL\17\bin\psql.exe' -U postgres -d clb_bongban -f full_backup.sql
```

---

## 🍎 MACOS/LINUX COMMANDS

### Export

```bash
# Export full database
pg_dump -U postgres -d clb_bongban > full_backup.sql

# With password prompt
PGPASSWORD=your_password pg_dump -U postgres -d clb_bongban > full_backup.sql
```

### Import

```bash
# Import
psql -U postgres -d clb_bongban < full_backup.sql

# With password
PGPASSWORD=your_password psql -U postgres -d clb_bongban < full_backup.sql
```

---

## ⚠️ COMMON ISSUES

### Issue 1: "Role does not exist"

**Error:**
```
ERROR: role "old_username" does not exist
```

**Solution:**
```bash
# Edit backup file and replace old username
# Find: OWNER TO old_username
# Replace: OWNER TO postgres

# OR import with --no-owner flag
psql -U postgres -d clb_bongban --no-owner < backup.sql
```

### Issue 2: "Relation already exists"

**Error:**
```
ERROR: relation "shop_orders" already exists
```

**Solution:**
```bash
# Option 1: Drop database first
psql -U postgres -c "DROP DATABASE clb_bongban;"
psql -U postgres -c "CREATE DATABASE clb_bongban;"
psql -U postgres -d clb_bongban < backup.sql

# Option 2: Import data only (skip CREATE statements)
psql -U postgres -d clb_bongban < backup.sql --data-only
```

### Issue 3: Duplicate key violations

**Error:**
```
ERROR: duplicate key value violates unique constraint
```

**Solution:**
```bash
# Truncate tables before import
psql -U postgres -d clb_bongban -c "TRUNCATE shop_orders CASCADE;"
psql -U postgres -d clb_bongban < backup.sql
```

---

## 📊 VERIFY MIGRATION SUCCESS

### Check Record Counts

```sql
-- Connect to database
psql -U postgres -d clb_bongban

-- Count records
SELECT COUNT(*) FROM shop_orders;
SELECT COUNT(*) FROM shop_products;
SELECT COUNT(*) FROM members;
SELECT COUNT(*) FROM events;

-- Check most recent orders
SELECT order_code, customer_name, created_at 
FROM shop_orders 
ORDER BY created_at DESC 
LIMIT 10;
```

### Test API Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Count orders (need admin token)
curl http://localhost:3000/api/shop/admin/orders

# Check products
curl http://localhost:3000/api/shop/products
```

---

## 🔄 AUTOMATED MIGRATION SCRIPT

Create `migrate-data.sh` (Unix/Mac):

```bash
#!/bin/bash

echo "📦 Starting data migration..."

# 1. Export from old machine
echo "📤 Exporting data from old machine..."
OLD_HOST="old-machine-ip"
pg_dump -h $OLD_HOST -U postgres -d clb_bongban > /tmp/backup.sql

# 2. Import to new machine
echo "📥 Importing data to new machine..."
psql -U postgres -d clb_bongban < /tmp/backup.sql

# 3. Verify
echo "✅ Verifying import..."
psql -U postgres -d clb_bongban -c "SELECT COUNT(*) FROM shop_orders;"

echo "🎉 Migration complete!"
```

Windows equivalent `migrate-data.ps1`:

```powershell
Write-Host "📦 Starting data migration..."

# Export
Write-Host "📤 Exporting data..."
& 'C:\Program Files\PostgreSQL\17\bin\pg_dump.exe' -U postgres -d clb_bongban > backup.sql

# Import (on different machine)
Write-Host "📥 Importing data..."
& 'C:\Program Files\PostgreSQL\17\bin\psql.exe' -U postgres -d clb_bongban -f backup.sql

Write-Host "🎉 Migration complete!"
```

---

## 🎯 BEST PRACTICES

### DO ✅

1. **Backup before migrating**
   ```bash
   # Always create a backup first
   pg_dump -U postgres -d clb_bongban > backup_before_migration.sql
   ```

2. **Test on sample data first**
   - Create test database
   - Import small dataset
   - Verify integrity

3. **Verify counts match**
   ```sql
   -- On OLD machine
   SELECT 'shop_orders' as table, COUNT(*) as count FROM shop_orders
   UNION ALL
   SELECT 'members', COUNT(*) FROM members;
   
   -- On NEW machine (should match)
   SELECT 'shop_orders' as table, COUNT(*) as count FROM shop_orders
   UNION ALL
   SELECT 'members', COUNT(*) FROM members;
   ```

4. **Use transactions**
   ```bash
   psql -U postgres -d clb_bongban << EOF
   BEGIN;
   \i backup.sql
   COMMIT;
   EOF
   ```

### DON'T ❌

1. ❌ **Don't skip verification**
2. ❌ **Don't delete old data immediately**
3. ❌ **Don't migrate partial tables** (can break foreign keys)
4. ❌ **Don't ignore errors** during import

---

## 📞 NEED HELP?

If migration fails:
1. Check PostgreSQL logs
   ```bash
   # Windows
   C:\Program Files\PostgreSQL\17\data\log\
   
   # Linux/Mac
   /var/log/postgresql/
   ```

2. Verify PostgreSQL running
   ```bash
   # Check status
   pg_isready
   
   # Windows
   Get-Service postgresql*
   ```

3. Test connection
   ```bash
   psql -U postgres -c "SELECT version();"
   ```

---

## 🚀 QUICK REFERENCE

### One-Line Export/Import

```bash
# Export and import in one command (network transfer)
pg_dump -h old-machine -U postgres clb_bongban | psql -U postgres -d clb_bongban
```

### Compress Backup

```bash
# Export compressed
pg_dump -U postgres -d clb_bongban | gzip > backup.sql.gz

# Import compressed
gunzip < backup.sql.gz | psql -U postgres -d clb_bongban
```

### Remote Connection

```bash
# Export from remote server
pg_dump -h remote-server.com -U postgres -d clb_bongban > backup.sql

# Import to local
psql -U postgres -d clb_bongban < backup.sql
```

---

**Last Updated:** December 20, 2025  
**Tested On:** PostgreSQL 17.7, Windows 11, macOS, Ubuntu 22.04

For more help, see `README.md` or `INCIDENT-MISSING-ORDERS.md`
