@echo off
SETLOCAL EnableDelayedExpansion

echo ========================================
echo   Bookera Real-Time Notifications Setup
echo ========================================
echo.

REM Backend Setup
echo [1/4] Installing Laravel Broadcasting packages...
cd bookera-api

composer show laravel/reverb >nul 2>&1
if errorlevel 1 (
    echo Installing Laravel Reverb...
    composer require laravel/reverb
    php artisan reverb:install
) else (
    echo Laravel Reverb already installed [OK]
)

echo.
echo [2/4] Generating broadcast keys...
php artisan config:clear
echo.

REM Frontend Setup
echo [3/4] Installing frontend packages...
cd ..\bookera-web

call npm list laravel-echo >nul 2>&1
if errorlevel 1 (
    echo Installing laravel-echo and pusher-js...
    call npm install laravel-echo pusher-js
) else (
    echo Packages already installed [OK]
)

echo.
echo [4/4] Setup complete!
echo.
echo ========================================
echo   Next Steps:
echo ========================================
echo.
echo 1. Update your .env files with broadcasting credentials
echo.
echo    Backend (bookera-api/.env):
echo    BROADCAST_CONNECTION=reverb
echo    REVERB_APP_KEY=^<your-key^>
echo.
echo    Frontend (bookera-web/.env.local):
echo    NEXT_PUBLIC_BROADCAST_DRIVER=reverb
echo    NEXT_PUBLIC_REVERB_APP_KEY=^<your-key^>
echo.
echo 2. Start the services:
echo.
echo    Terminal 1: php artisan serve
echo    Terminal 2: php artisan reverb:start
echo    Terminal 3: php artisan queue:work
echo    Terminal 4: npm run dev
echo.
echo 3. Test real-time notifications!
echo.
echo For detailed setup instructions, see:
echo REALTIME_NOTIFICATIONS_SETUP.md
echo.

cd ..
pause
