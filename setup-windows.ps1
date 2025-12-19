#!/usr/bin/env pwsh
# Windows Setup Script for CLB Bóng Bàn Project
# Run this script with: .\setup-windows.ps1

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "CLB BÓNG BÀN LÊ QUÝ ĐÔN - SETUP" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "[1/8] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found! Please install from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL
Write-Host "[2/8] Checking PostgreSQL..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version
    Write-Host "✓ PostgreSQL found: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠ PostgreSQL not found or not in PATH" -ForegroundColor Yellow
    Write-Host "  Please install from https://www.postgresql.org/download/" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") { exit 1 }
}

# Install Backend Dependencies
Write-Host "[3/8] Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Backend npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
Set-Location ..

# Install Frontend Dependencies
Write-Host "[4/8] Installing frontend dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Frontend npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green

# Setup Backend .env
Write-Host "[5/8] Setting up backend environment..." -ForegroundColor Yellow
if (!(Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "⚠ Created backend\.env file" -ForegroundColor Yellow
    Write-Host "  Please edit backend\.env and set your PostgreSQL password" -ForegroundColor Yellow
    $dbPassword = Read-Host " Enter PostgreSQL password for user 'postgres'"
    
    $envContent = Get-Content "backend\.env" -Raw
    $envContent = $envContent -replace "DB_PASSWORD=your_postgres_password_here", "DB_PASSWORD=$dbPassword"
    Set-Content "backend\.env" $envContent
    Write-Host "✓ Database password configured" -ForegroundColor Green
} else {
    Write-Host "✓ backend\.env already exists" -ForegroundColor Green
}

# Create Database
Write-Host "[6/8] Creating database..." -ForegroundColor Yellow
$env:PGPASSWORD = (Get-Content "backend\.env" | Select-String "DB_PASSWORD" | ForEach-Object { $_.ToString().Split('=')[1] })
try {
    $createDb = psql -U postgres -c "CREATE DATABASE clb_bongban;" 2>&1
    if ($LASTEXITCODE -eq 0 -or $createDb -match "already exists") {
        Write-Host "✓ Database exists" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠ Could not create database automatically" -ForegroundColor Yellow
    Write-Host "  Run manually: psql -U postgres -c `"CREATE DATABASE clb_bongban;`"" -ForegroundColor Yellow
}

# Run Migrations
Write-Host "[7/8] Running database migrations..." -ForegroundColor Yellow
Set-Location backend
try {
    npm run db:migrate
    Write-Host "✓ Migrations completed" -ForegroundColor Green
} catch {
    Write-Host "⚠ Migrations may have failed" -ForegroundColor Yellow
}

# Create Admin User
Write-Host "[8/8] Creating admin user..." -ForegroundColor Yellow
try {
    node src/database/create-admin.js
    Write-Host "✓ Admin user ready" -ForegroundColor Green
} catch {
    Write-Host "⚠ Admin user creation may have failed" -ForegroundColor Yellow
}
Set-Location ..

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✓ SETUP COMPLETE!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the application:" -ForegroundColor White
Write-Host "  1. Backend:  cd backend && npm run dev" -ForegroundColor Yellow
Write-Host "  2. Frontend: npm run dev (in new terminal)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Admin Login:" -ForegroundColor White
Write-Host "  URL:      http://localhost:5173/admin" -ForegroundColor Cyan
Write-Host "  Username: admin" -ForegroundColor Cyan
Write-Host "  Password: admin123" -ForegroundColor Cyan
Write-Host ""
