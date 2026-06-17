@echo off
REM Chat With You - Windows Setup Script
REM This script sets up your local development environment

setlocal enabledelayedexpansion

echo.
echo ================================
echo Chat With You - Setup Script
echo ================================
echo.

REM Check if node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js found: 
node --version

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed or not in PATH
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

echo ✓ Git found: 
git --version
echo.

REM Install dependencies
echo [1/5] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

REM Generate Prisma client
echo [2/5] Generating Prisma client...
call npm run prisma:generate
if errorlevel 1 (
    echo ERROR: Prisma generate failed
    pause
    exit /b 1
)
echo ✓ Prisma client generated
echo.

REM Run migrations
echo [3/5] Running database migrations...
echo Note: Make sure DATABASE_URL is set in .env.local
call npm run prisma:migrate
if errorlevel 1 (
    echo WARNING: Migrations may have failed (this is normal if DB not set up yet)
)
echo.

REM Seed database
echo [4/5] Seeding database with test data...
call npm run prisma:seed
if errorlevel 1 (
    echo WARNING: Seeding may have failed (this is normal if DB not set up yet)
)
echo.

REM Initialize git
echo [5/5] Initializing git repository...
git status >nul 2>&1
if errorlevel 1 (
    echo Initializing git...
    git init
    git config user.name "Chat With You"
    git config user.email "you@example.com"
)
echo ✓ Git ready
echo.

echo ================================
echo ✓ Setup Complete!
echo ================================
echo.
echo Next steps:
echo.
echo 1. Configure .env.local with your database URL
echo    (See .env.example for reference)
echo.
echo 2. Run the dev server:
echo    npm run dev
echo.
echo 3. Open http://localhost:3000 in your browser
echo.
echo 4. For deployment, see DEPLOY.md
echo.
echo ================================
echo.

pause
