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

echo [3/3] Seeding database...
call npm run seed
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to seed database.
    pause
    exit /b 1
)
echo Database seeded.
echo.

echo ============================================
echo  Setup complete. Starting the application...
echo ============================================
echo.

echo Starting server and client...
start cmd /c "cd server && npm run dev"
timeout /t 5 /nobreak >nul
start cmd /c "cd client && npm run dev"

echo.
echo Application is starting...
echo Server: http://localhost:5000 (or check console)
echo Client: http://localhost:5173 (or check console)
echo.
pause
