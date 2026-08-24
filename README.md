<div align="center">

# 📚 Bookera — Modern Library Management System

**An All-in-One, Real-Time Enterprise Library Solution featuring Dual Next.js 16 Client Portals and a Laravel 12 API with AI Assistance**

[![Laravel](https://img.shields.io/badge/Laravel-12.0-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Laravel Reverb](https://img.shields.io/badge/Laravel_Reverb-Websocket-00ff88?style=for-the-badge&logo=laravel&logoColor=black)](https://laravel.com/docs/12.x/reverb)
[![Midtrans](https://img.shields.io/badge/Midtrans-Payment_Gateway-003B9F?style=for-the-badge&logoColor=white)](https://midtrans.com/)

---

</div>

## 📌 Overview

**Bookera** is an enterprise-grade library management ecosystem engineered to bridge the gap between traditional library catalogs and modern digital workflows. Featuring a dual-frontend client architecture (an admin control dashboard and a public-facing digital library app), Bookera integrates secure client-server authentication, real-time WebSocket notifications via **Laravel Reverb**, online fine payments via the **Midtrans Payment Gateway**, and AI-powered book recommendations and reader assistance.

Built on a robust Laravel 12 REST API, Next.js 16 App Router, TypeScript, and Tailwind CSS, Bookera supports multi-language locales, advanced catalog index indexing, and comprehensive digital reporting for school, university, and community libraries.

---

## ✨ Key Features & Capability Matrix

### 🔐 1. Multichannel Role Architecture
* **Admin & Officer Channel**: Separate backend admin application (`bookera_admin`) for managing book assets, barcodes, users, returns, activity logs, and system analytics.
* **Member/Public Channel**: Minimalist, responsive member web app (`bookera_library`) allowing users to request loans, track pending returns, pay outstanding fines, comment, and chat.
* **Granular Role Guarding**: API requests are protected via Laravel Sanctum tokens and customized middleware checking.

### 🧰 2. Complete Capability Matrix

| Feature Module | Admin / Officer Functionality | Member / Public Functionality |
| :--- | :--- | :--- |
| **Cataloging & Books** | Bulk Excel imports/exports, barcode & copy trackers, category & genre CRUD | Advanced keyword filtering, reviews, rating, and global search |
| **Borrowing Workflow** | Confirm loan requests, record manual handovers, view active loan logs | Online borrow requests, cancel pending requests, check status |
| **Fine System & Payments** | Create fine types, mark paid manually, track overdue items | Pay fines online via **Midtrans Payment Gateway** or track fees |
| **User Notifications** | Broadcast site-wide alerts and updates in real-time | Receive instant popups for approved loans and payment updates |
| **Reservations System** | Forecast queue waiting times, manage priority reservations | Request book reservations when copies are out of stock |
| **User Chat & Community** | Admin message board moderation, responding to inquiries | Peer-to-peer chat, follow other users, post complaints |
| **AI Assistant** | System prompt fine-tuning controls | Chat with book recommendations bot, clear chat history |

### ⚡ 3. Real-Time WebSockets & AI Integration
* **Laravel Reverb WebSockets**: Built-in, high-speed WebSocket connection pushing real-time notification alerts, chat messages, and loan status updates.
* **AI Chat Bot**: Conversational reader assistant powered by custom LLM integrations (`AIChatController`) suggesting books by genre, themes, or historical topics.

---

## 🏗️ Monorepo Architecture & Technology Stack

Bookera is designed as a unified codebase composed of one backend API service and two separate Next.js web applications:

```text
bookera/
├── bookera_api/                 # Laravel 12 Backend API
│   ├── app/
│   │   ├── Http/Controllers/Api/# API Controllers (AIChat, Auth, Chat, Book, etc.)
│   │   ├── Models/              # Eloquent Models (Book, Borrow, Fine, Reservation, etc.)
│   │   └── Helpers/             # Global utility helpers
│   ├── config/                  # Reverb, Sanctum, and third-party configuration files
│   ├── database/                # SQLite/MySQL migrations & factory seeders
│   ├── routes/                  # API endpoints and WebSocket broadcast routes
│   └── tests/                   # Backend API test suites
├── bookera_web/                 # Next.js 16 Frontend Applications
│   ├── bookera_admin/           # Dashboard Web Portal for Admin & Officers
│   │   ├── src/
│   │   │   ├── app/             # App Router pages and layouts
│   │   │   ├── components/      # UI components (Shadcn/ui, buttons)
│   │   │   ├── services/        # Backend API service fetchers
│   │   │   └── store/           # Zustand state managers
│   │   └── package.json
│   └── bookera_library/         # Library Web Portal for Public Members
│       ├── src/
│       │   ├── app/             # Responsive user views (shelf, chats, fines)
│       │   ├── components/      # User-facing library layout components
│       │   ├── services/        # Member API fetchers
│       │   └── store/           # State management
│       └── package.json
└── assets/                      # Static logos and demo screenshots
```

### 💻 Stack Summary

| Layer | Technology |
| :--- | :--- |
| **Backend API** | Laravel 12.x, PHP 8.2+, Laravel Sanctum |
| **Web portals** | Next.js 16 (App Router), React 19, TypeScript, Shadcn UI, Zustand |
| **Styling** | Tailwind CSS 4.x, PostCSS |
| **Real-time WebSockets**| Laravel Reverb, Pusher / Laravel Echo |
| **Payment Gateway** | Midtrans PHP SDK 2.6 |
| **Utilities** | Intervention Image 3.11, Simple Software IO QR Code, Maatwebsite Excel |
| **Database** | MySQL / SQLite |

---

## 🚀 Getting Started

### Prerequisites
* **PHP**: `v8.2` or higher
* **Composer**: `v2.x` or higher
* **Node.js**: `v18.x` or higher
* **NPM**: `v10.x` or higher
* **MySQL**: `v8.x` or higher (optional, defaults to SQLite)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/bookera.git
cd bookera
```

### 2. Configure the Backend (bookera_api)
```bash
cd bookera_api
composer install
cp .env.example .env
```
Open `.env` and configure key parameters:
```env
DB_CONNECTION=sqlite # Or mysql

# Laravel Reverb websocket configs
REVERB_APP_ID=
REVERB_APP_KEY=
REVERB_APP_SECRET=

# Midtrans payment configurations
MIDTRANS_MERCHANT_ID=
MIDTRANS_CLIENT_KEY=
MIDTRANS_SERVER_KEY=
MIDTRANS_IS_PRODUCTION=false
```
Execute key setup and database migrations:
```bash
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
```

### 3. Configure Frontend Apps (bookera_web)
Setup **bookera_admin**:
```bash
cd ../bookera_web/bookera_admin
npm install
cp .env.example .env
```

Setup **bookera_library**:
```bash
cd ../bookera_library
npm install
cp .env.example .env
```

---

## ⚙️ Running the Application

To run the full Bookera ecosystem locally, you will need to start the following processes in separate terminals:

### Terminal 1: Backend API
```bash
cd bookera_api
php artisan serve
```

### Terminal 2: Queue Workers
```bash
cd bookera_api
php artisan queue:work
```

### Terminal 3: WebSocket Server
```bash
cd bookera_api
php artisan reverb:start
```

### Terminal 4: Admin Web Dashboard
```bash
cd bookera_web/bookera_admin
npm run dev
```

### Terminal 5: Library Member Web App
```bash
cd bookera_web/bookera_library
npm run dev
```

### Default Credentials
* **Admin Role**: `admin@bookera.com` / `admin123`
* **Officer Role**: `officer@bookera.com` / `officer123`
* **Member Role**: `member@bookera.com` / `member123`

---

## 🧪 Available Scripts

### Backend Scripts (`bookera_api/`)
| Script | Command | Description |
| :--- | :--- | :--- |
| **Dev Server Pipeline** | `composer dev` | Launches PHP server, Queue listener, and Pail logs in parallel |
| **Run Tests** | `composer test` | Runs the test suites via PHPUnit |
| **Lint Code** | `./vendor/bin/pint` | Formats codebase files according to Laravel standards |

### Frontend Scripts (`bookera_admin/` & `bookera_library/`)
| Script | Command | Description |
| :--- | :--- | :--- |
| **Dev Server** | `npm run dev` | Starts the Next.js local development server |
| **Production Build** | `npm run build` | Builds optimized client-side React bundles |
| **Lint Check** | `npm run lint` | Runs ESLint configuration checkers |

---

## 🔒 Access Control & Secure Payment Contract

Bookera enforces a strict security protocol:
1. **Midtrans Handshakes**: Payment tokens are generated on the server using secure private keys and verified via HMAC signatures to prevent transaction tampering.
2. **WebSocket Channels Auth**: Channel subscriptions on Laravel Reverb (e.g. user chat, notifications) are authorized via signed HTTP requests using Sanctum auth.
3. **Password Security**: User credentials are encrypted using `bcrypt` (10 rounds) and database models sanitize user tokens on serializations.
4. **Roles-Guarded API**: Admin/officer APIs are restricted strictly by `role:admin` and `role:officer` guards.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

**Built with ❤️ for developers by developers.**

</div>
