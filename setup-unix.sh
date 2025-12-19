#!/bin/bash
# Unix/Mac/Linux Setup Script for CLB Bóng Bàn Project
# Run this script with: bash setup-unix.sh

echo "================================="
echo "CLB BÓNG BÀN LÊ QUÝ ĐÔN - SETUP"
echo "================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${YELLOW}[1/8] Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js found: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found! Please install from https://nodejs.org${NC}"
    exit 1
fi

# Check PostgreSQL
echo -e "${YELLOW}[2/8] Checking PostgreSQL...${NC}"
if command -v psql &> /dev/null; then
    PG_VERSION=$(psql --version)
    echo -e "${GREEN}✓ PostgreSQL found: $PG_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ PostgreSQL not found or not in PATH${NC}"
    echo "  Please install PostgreSQL first"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install Backend Dependencies
echo -e "${YELLOW}[3/8] Installing backend dependencies...${NC}"
cd backend
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Backend npm install failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
cd ..

# Install Frontend Dependencies
echo -e "${YELLOW}[4/8] Installing frontend dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Frontend npm install failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Setup Backend .env
echo -e "${YELLOW}[5/8] Setting up backend environment...${NC}"
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}⚠ Created backend/.env file${NC}"
    echo "  Please edit backend/.env and set your PostgreSQL password"
    read -p " Enter PostgreSQL password for user 'postgres': " DB_PASSWORD
    
    # Update .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/DB_PASSWORD=your_postgres_password_here/DB_PASSWORD=$DB_PASSWORD/" backend/.env
    else
        # Linux
        sed -i "s/DB_PASSWORD=your_postgres_password_here/DB_PASSWORD=$DB_PASSWORD/" backend/.env
    fi
    echo -e "${GREEN}✓ Database password configured${NC}"
else
    echo -e "${GREEN}✓ backend/.env already exists${NC}"
fi

# Create Database
echo -e "${YELLOW}[6/8] Creating database...${NC}"
DB_PASSWORD=$(grep DB_PASSWORD backend/.env | cut -d '=' -f2)
export PGPASSWORD=$DB_PASSWORD

# Try to create database
psql -U postgres -c "CREATE DATABASE clb_bongban;" 2>&1 | grep -q "already exists"
if [ $? -eq 0 ] || [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo -e "${GREEN}✓ Database exists${NC}"
else
    echo -e "${YELLOW}⚠ Could not create database automatically${NC}"
    echo "  Run manually: psql -U postgres -c \"CREATE DATABASE clb_bongban;\""
fi

# Run Migrations
echo -e "${YELLOW}[7/8] Running database migrations...${NC}"
cd backend
npm run db:migrate
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migrations completed${NC}"
else
    echo -e "${YELLOW}⚠ Migrations may have failed${NC}"
fi

# Create Admin User
echo -e "${YELLOW}[8/8] Creating admin user...${NC}"
node src/database/create-admin.js
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Admin user ready${NC}"
else
    echo -e "${YELLOW}⚠ Admin user creation may have failed${NC}"
fi
cd ..

echo ""
echo "================================="
echo -e "${GREEN}✓ SETUP COMPLETE!${NC}"
echo "================================="
echo ""
echo "To start the application:"
echo -e "${YELLOW}  1. Backend:  cd backend && npm run dev${NC}"
echo -e "${YELLOW}  2. Frontend: npm run dev (in new terminal)${NC}"
echo ""
echo "Admin Login:"
echo -e "${CYAN}  URL:      http://localhost:5173/admin${NC}"
echo -e "${CYAN}  Username: admin${NC}"
echo -e "${CYAN}  Password: admin123${NC}"
echo ""
