@echo off
echo ============================================
echo  StressManage - Setup Script
echo ============================================
echo.

echo Checking for Node.js...
node -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed.
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo Node.js found.
echo.

echo [1/3] Installing server dependencies...
cd server
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to install server dependencies.
    pause
    exit /b 1
)
echo Server dependencies installed.
echo.

echo [2/3] Installing client dependencies...
cd ..\client
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to install client dependencies.
    pause
    exit /b 1
)
echo Client dependencies installed.
echo.

cd ..

echo [3/3] Checking .env file...
if not exist .env (
    copy .env.example .env >nul
    echo Created .env from .env.example.
    echo IMPORTANT: Open the .env file and update MONGO_URI with your MongoDB Atlas connection string.
) else (
    echo .env file already exists.
)

echo.
echo ============================================
echo  Setup complete.
echo ============================================
echo.
echo Next steps:
echo   1. Update MONGO_URI in the .env file
echo   2. Run: npm run seed    (load sample data)
echo   3. Run: npm run dev     (start the application)
echo.
pause
