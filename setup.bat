@echo off
setlocal EnableExtensions

set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"

set "SERVER_DIR=%ROOT_DIR%\server"
set "CLIENT_DIR=%ROOT_DIR%\client"
set "ENV_FILE=%ROOT_DIR%\.env"
set "ENV_EXAMPLE=%ROOT_DIR%\.env.example"

echo ============================================
echo  StressManage - Setup Script
echo ============================================
echo.

echo Checking for Node.js...
where node >nul 2>&1
if errorlevel 1 (
    call :InstallNodeIfPossible
    exit /b 1
)

for /f "delims=" %%v in ('node -p "process.versions.node"') do set "NODE_VERSION=%%v"
for /f "tokens=1 delims=." %%v in ("%NODE_VERSION%") do set "NODE_MAJOR=%%v"
if not defined NODE_MAJOR (
    echo ERROR: Unable to detect the installed Node.js version.
    pause
    exit /b 1
)
if %NODE_MAJOR% LSS 18 (
    echo ERROR: Node.js %NODE_VERSION% detected.
    echo Please install Node.js 18 or later from https://nodejs.org
    pause
    exit /b 1
)
echo Node.js %NODE_VERSION% found.
echo.

echo Checking for npm...
where npm >nul 2>&1
if errorlevel 1 (
    call :InstallNodeIfPossible
    exit /b 1
)

for /f "delims=" %%v in ('npm -v') do set "NPM_VERSION=%%v"
echo npm %NPM_VERSION% found.
echo.

if not exist "%ENV_FILE%" (
    if exist "%ENV_EXAMPLE%" (
        echo No .env file found. Creating one from .env.example...
        copy /Y "%ENV_EXAMPLE%" "%ENV_FILE%" >nul
        if errorlevel 1 (
            echo ERROR: Failed to create .env from .env.example.
            pause
            exit /b 1
        )
        echo Created .env at %ENV_FILE%
        echo.
        echo Update MONGO_URI in .env with your MongoDB Atlas connection string,
        echo then run setup.bat again.
        echo.
        pause
        exit /b 1
    ) else (
        echo ERROR: .env is missing and .env.example was not found.
        pause
        exit /b 1
    )
)

set "HAS_MONGO_URI=false"
for /f "usebackq tokens=1,* delims==" %%A in ("%ENV_FILE%") do (
    if /I "%%A"=="MONGO_URI" (
        set "MONGO_URI_VALUE=%%B"
        set "HAS_MONGO_URI=true"
    )
)

if /I "%HAS_MONGO_URI%" NEQ "true" (
    echo ERROR: MONGO_URI is missing in .env.
    echo Add your MongoDB Atlas connection string to %ENV_FILE% and run setup.bat again.
    echo.
    pause
    exit /b 1
)

if /I "%MONGO_URI_VALUE%"=="your_mongodb_atlas_connection_string_here" (
    echo ERROR: MONGO_URI is still set to the placeholder value in .env.
    echo Update %ENV_FILE% with your real MongoDB Atlas connection string,
    echo then run setup.bat again.
    echo.
    pause
    exit /b 1
)

echo Environment file looks ready.
echo.

echo [1/4] Installing server dependencies...
pushd "%SERVER_DIR%"
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install server dependencies.
    popd
    pause
    exit /b 1
)
popd
echo Server dependencies installed.
echo.

echo [2/4] Installing client dependencies...
pushd "%CLIENT_DIR%"
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install client dependencies.
    popd
    pause
    exit /b 1
)
popd
echo Client dependencies installed.
echo.

echo [3/4] Seeding database...
pushd "%SERVER_DIR%"
call npm run seed
if errorlevel 1 (
    echo ERROR: Failed to seed database.
    echo Check your MONGO_URI and MongoDB Atlas IP allowlist, then run setup.bat again.
    popd
    pause
    exit /b 1
)
popd
echo Database seeded.
echo.

echo [4/4] Starting the application...
start "StressManage Server" cmd /k "cd /d ""%SERVER_DIR%"" && npm run dev"
timeout /t 5 /nobreak >nul
start "StressManage Client" cmd /k "cd /d ""%CLIENT_DIR%"" && npm run dev"

echo.
echo ============================================
echo  Setup complete.
echo ============================================
echo Server: http://localhost:5000
echo Client: http://localhost:5173
echo.
echo If the client cannot reach the database, make sure your MongoDB Atlas
echo IP access list allows connections from your current network.
echo.
pause

goto :eof

:InstallNodeIfPossible
echo ERROR: Node.js and npm are required but were not found in PATH.
where winget >nul 2>&1
if errorlevel 1 (
    echo Please install Node.js 18 or later from https://nodejs.org
    pause
    exit /b 1
)

echo Winget is available on this machine.
choice /M "Install Node.js LTS automatically with winget now"
if errorlevel 2 (
    echo Please install Node.js 18 or later from https://nodejs.org
    pause
    exit /b 1
)

winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
if errorlevel 1 (
    echo ERROR: Automatic Node.js installation failed.
    echo Please install Node.js manually from https://nodejs.org
    pause
    exit /b 1
)

echo.
echo Node.js LTS installation finished.
echo Please close this window and run setup.bat again so PATH updates are picked up.
echo.
pause
exit /b 1
