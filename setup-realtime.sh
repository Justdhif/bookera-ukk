#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Bookera Real-Time Notifications Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Backend Setup
echo -e "${GREEN}[1/4] Installing Laravel Broadcasting packages...${NC}"
cd bookera-api

if ! composer show laravel/reverb &> /dev/null; then
    echo "Installing Laravel Reverb..."
    composer require laravel/reverb
    php artisan reverb:install
else
    echo "Laravel Reverb already installed ✓"
fi

echo ""
echo -e "${GREEN}[2/4] Generating broadcast keys...${NC}"
php artisan config:clear
echo ""

# Frontend Setup  
echo -e "${GREEN}[3/4] Installing frontend packages...${NC}"
cd ../bookera-web

if ! npm list laravel-echo &> /dev/null; then
    echo "Installing laravel-echo and pusher-js..."
    npm install laravel-echo pusher-js
else
    echo "Packages already installed ✓"
fi

echo ""
echo -e "${GREEN}[4/4] Setup complete!${NC}"
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Next Steps:${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "1. Update your .env files with broadcasting credentials"
echo ""
echo "   Backend (bookera-api/.env):"
echo "   BROADCAST_CONNECTION=reverb"
echo "   REVERB_APP_KEY=<your-key>"
echo ""
echo "   Frontend (bookera-web/.env.local):"
echo "   NEXT_PUBLIC_BROADCAST_DRIVER=reverb"
echo "   NEXT_PUBLIC_REVERB_APP_KEY=<your-key>"
echo ""
echo "2. Start the services:"
echo ""
echo "   Terminal 1: php artisan serve"
echo "   Terminal 2: php artisan reverb:start"
echo "   Terminal 3: php artisan queue:work"
echo "   Terminal 4: npm run dev"
echo ""
echo "3. Test real-time notifications!"
echo ""
echo -e "${GREEN}For detailed setup instructions, see:${NC}"
echo "REALTIME_NOTIFICATIONS_SETUP.md"
echo ""
