# 🔔 Real-Time Notifications Setup Guide

Panduan lengkap untuk mengaktifkan notifikasi real-time menggunakan Laravel Broadcasting dengan Reverb.

## 📋 Overview

Sistem notifikasi real-time akan mengirim notifikasi secara instant menggunakan WebSocket ketika:
- User melakukan request peminjaman buku → Admin menerima notifikasi
- Admin approve/reject peminjaman → User menerima notifikasi
- User melakukan request pengembalian → Admin menerima notifikasi
- Admin memproses pengembalian → User menerima notifikasi

---

## ✅ Prerequisites

Pastikan sudah terinstall:
- PHP 8.2+
- Node.js 18+
- Composer
- Laravel 12
- Next.js 16

---

## 🚀 Quick Start

### 1. Backend Setup (Laravel)

#### Install Laravel Reverb

```bash
cd bookera-api
composer require laravel/reverb
php artisan reverb:install
```

Perintah di atas akan:
- Install package Laravel Reverb
- Membuat file konfigurasi `config/reverb.php`
- Menambahkan environment variables ke `.env`

#### Configure .env

Buka file `bookera-api/.env` dan update bagian broadcasting:

```dotenv
# Broadcasting Configuration
BROADCAST_CONNECTION=reverb
QUEUE_CONNECTION=database

# Laravel Reverb Configuration
REVERB_APP_ID=your-app-id
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

# Untuk production gunakan wss:
# REVERB_SCHEME=https
# REVERB_PORT=443
```

**Note:** Nilai `REVERB_APP_ID`, `REVERB_APP_KEY`, dan `REVERB_APP_SECRET` akan otomatis di-generate saat menjalankan `php artisan reverb:install`.

#### Migrate Queue Tables (jika belum)

```bash
php artisan queue:table
php artisan migrate
```

---

### 2. Frontend Setup (Next.js)

#### Install Packages

Package `laravel-echo` dan `pusher-js` sudah terinstall ✅

#### Configure .env

File `bookera-web/.env` sudah dikonfigurasi, pastikan nilai `NEXT_PUBLIC_REVERB_APP_KEY` sama dengan `REVERB_APP_KEY` di backend:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Broadcasting Configuration
NEXT_PUBLIC_BROADCAST_DRIVER=reverb

# Reverb Configuration (harus sama dengan backend)
NEXT_PUBLIC_REVERB_APP_KEY=your-app-key
NEXT_PUBLIC_REVERB_HOST=localhost
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_REVERB_SCHEME=http
```

**PENTING:** Ganti `your-app-key` dengan nilai yang sama dari `REVERB_APP_KEY` di `bookera-api/.env`

---

## 🎯 Starting Services

Untuk menjalankan real-time notifications, Anda perlu menjalankan 4 service:

### Terminal 1: Laravel API Server
```bash
cd bookera-api
php artisan serve
```

### Terminal 2: Laravel Reverb Server
```bash
cd bookera-api
php artisan reverb:start
```

Output yang benar:
```
  INFO  Starting Reverb server...

  Press Ctrl+C to stop the server

  INFO  Broadcasting on host 127.0.0.1:8080
```

### Terminal 3: Laravel Queue Worker
```bash
cd bookera-api
php artisan queue:work
```

**PENTING:** Queue worker diperlukan agar event broadcasting bisa diproses.

### Terminal 4: Next.js Dev Server
```bash
cd bookera-web
npm run dev
```

---

## 🧪 Testing Real-Time Notifications

### Scenario 1: Loan Request
1. Login sebagai **user biasa**
2. Buka halaman **My Loans** dan buat request peminjaman buku
3. Buka tab/browser baru, login sebagai **admin**
4. Admin akan melihat **toast notification** langsung tanpa refresh:
   ```
   📚 New Loan Request
   [User Name] requested to borrow [Book Titles]
   ```

### Scenario 2: Loan Approval
1. Admin approve loan request (dari scenario 1)
2. User akan melihat **toast notification** langsung:
   ```
   ✅ Loan Approved
   Your loan request has been approved
   ```

### Scenario 3: Loan Rejection
1. Admin reject loan request
2. User akan melihat **toast notification**:
   ```
   ❌ Loan Rejected
   Your loan request has been rejected. Reason: [rejection reason]
   ```

### Scenario 4: Return Request
1. User request pengembalian buku (dari loan yang sudah approved)
2. Admin akan melihat **toast notification**:
   ```
   📦 New Return Request
   [User Name] requested to return books for loan #[loan_id]
   ```

### Scenario 5: Return Completion
1. Admin memproses (approve) return request
2. User akan melihat **toast notification**:
   ```
   ✅ Return Completed
   Your book return has been processed
   ```

---

## 🔍 Troubleshooting

### 1. Tidak Menerima Notifikasi Real-Time

**Cek Browser Console (F12):**

```javascript
// Seharusnya muncul log seperti ini:
Echo initialized
Connected to channel: private-admin
// atau
Connected to channel: private-user.123
```

**Solusi:**
- Pastikan Reverb server sudah running (`php artisan reverb:start`)
- Pastikan Queue worker sudah running (`php artisan queue:work`)
- Cek nilai `NEXT_PUBLIC_REVERB_APP_KEY` di frontend sama dengan `REVERB_APP_KEY` di backend
- Cek `NEXT_PUBLIC_REVERB_HOST` dan `NEXT_PUBLIC_REVERB_PORT` sesuai dengan Reverb server

### 2. Error "Could not connect to WebSocket"

**Penyebab:** Reverb server tidak running atau port sudah dipakai.

**Solusi:**
```bash
# Pastikan Reverb server running
cd bookera-api
php artisan reverb:start

# Jika port 8080 sudah dipakai, ganti port di .env:
REVERB_PORT=8081
NEXT_PUBLIC_REVERB_PORT=8081
```

### 3. Error 403 Forbidden pada Private Channel

**Penyebab:** User tidak ter-autentikasi atau tidak memiliki akses ke channel.

**Solusi:**
- Pastikan user sudah login
- Cek file `bookera-api/routes/channels.php` untuk aturan authorization
- Cek Sanctum token di cookie (`bookera_token`)

### 4. Queue Jobs Tidak Diproses

**Penyebab:** Queue worker tidak running.

**Solusi:**
```bash
cd bookera-api
php artisan queue:work

# Atau untuk development, bisa pakai sync driver (tidak disarankan):
# QUEUE_CONNECTION=sync di .env
```

### 5. Notifikasi Diterima Tapi Tidak Muncul Toast

**Solusi:**
- Cek Browser Console untuk error
- Pastikan `sonner` toast library berfungsi
- Cek hook `useRealTimeNotifications` sudah dipanggil di component

---

## 📂 Files Modified/Created

### Backend Files
- ✅ `bookera-api/config/broadcasting.php` - Broadcasting configuration
- ✅ `bookera-api/routes/channels.php` - Channel authorization
- ✅ `bookera-api/bootstrap/app.php` - Register channels route
- ✅ `bookera-api/app/Events/*.php` - All events implement ShouldBroadcast
- ✅ `bookera-api/app/Listeners/*.php` - Send notifications

### Frontend Files
- ✅ `bookera-web/src/lib/echo.ts` - Laravel Echo client setup
- ✅ `bookera-web/src/hooks/useRealTimeNotifications.ts` - React hook
- ✅ `bookera-web/src/components/custom-ui/navbar/NotificationDropdown.tsx` - Using real-time hook
- ✅ `bookera-web/src/components/custom-ui/content/notification/NotificationPageClient.tsx` - Using real-time hook

---

## 🔐 Channel Authorization

### Private Channel: `admin`
**Who Can Subscribe:** Users dengan `role = 'admin'`

**Events:**
- `loan.requested` - Ketika user request peminjaman
- `return.requested` - Ketika user request pengembalian

### Private Channel: `user.{userId}`
**Who Can Subscribe:** User dengan ID yang sesuai

**Events:**
- `loan.approved` - Ketika loan di-approve
- `loan.rejected` - Ketika loan di-reject
- `return.approved` - Ketika return di-approve (completed)

---

## 🌐 Production Deployment

### Using Reverb (Recommended - Free)

1. **Server dengan SSL/HTTPS:**
```dotenv
# Backend .env
REVERB_SCHEME=https
REVERB_PORT=443
REVERB_HOST=your-domain.com

# Frontend .env
NEXT_PUBLIC_REVERB_SCHEME=https
NEXT_PUBLIC_REVERB_PORT=443
NEXT_PUBLIC_REVERB_HOST=your-domain.com
```

2. **Configure Nginx/Apache untuk reverse proxy ke Reverb**

Nginx example:
```nginx
location /reverb {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

3. **Run Reverb dengan Supervisor (untuk auto-restart)**

```ini
[program:reverb]
command=php /path/to/bookera-api/artisan reverb:start
autostart=true
autorestart=true
user=www-data
stdout_logfile=/var/log/reverb.log
```

### Using Pusher (Commercial)

1. **Sign up at [pusher.com](https://pusher.com)**

2. **Update Backend .env:**
```dotenv
BROADCAST_CONNECTION=pusher

PUSHER_APP_ID=your-pusher-app-id
PUSHER_APP_KEY=your-pusher-key
PUSHER_APP_SECRET=your-pusher-secret
PUSHER_APP_CLUSTER=ap1
```

3. **Update Frontend .env:**
```dotenv
NEXT_PUBLIC_BROADCAST_DRIVER=pusher

NEXT_PUBLIC_PUSHER_APP_KEY=your-pusher-key
NEXT_PUBLIC_PUSHER_APP_CLUSTER=ap1
```

**Note:** Dengan Pusher, tidak perlu menjalankan Reverb server sendiri.

---

## 📊 Architecture Diagram

```
┌─────────┐                       ┌──────────┐
│  User   │───HTTP (Loan Request)─→│ Laravel  │
└─────────┘                       │   API    │
     ↑                            └─────┬────┘
     │                                  │
     │                            ┌─────▼─────┐
     │                            │   Queue   │
     │      ┌─────────────────────│  Worker   │
     │      │                     └─────┬─────┘
     │      │                           │
     │      │ WebSocket             ┌───▼────┐
     │      │ (Broadcast)           │ Events │
     │      │                       │Dispatch│
     │      │                       └───┬────┘
     │      │                           │
     │   ┌──▼──────┐             ┌──────▼───────┐
     └───│ Reverb  │◄────────────│  Listeners   │
         │ Server  │             │(Notification)│
         └─────────┘             └──────────────┘
              ↑
              │ WebSocket
              │ Subscribe
         ┌────┴─────┐
         │ Next.js  │
         │  (Echo)  │
         └──────────┘
```

---

## 📝 Event Flow

### Loan Request Flow
```
User Action → BookLoanService.createLoan()
  → event(new LoanRequested($loan))
    → SendLoanNotification listener
      → NotificationService.send() (save to DB)
      → Broadcast to 'admin' channel
        → Admin receives real-time notification
```

### Loan Approval Flow
```
Admin Action → ApprovalService.approveLoan()
  → event(new LoanApproved($loan))
    → SendLoanNotification listener
      → NotificationService.send() (save to DB)
      → Broadcast to 'user.{userId}' channel
        → User receives real-time notification
```

### Return Request Flow
```
User Action → BookReturnService.createReturn()
  → event(new ReturnRequested($bookReturn))
    → SendReturnNotification listener
      → NotificationService.send() (save to DB)
      → Broadcast to 'admin' channel
        → Admin receives real-time notification
```

### Return Completion Flow
```
Admin Action → BookReturnService.approveReturn()
  → event(new ReturnApproved($bookReturn))
    → SendReturnNotification listener
      → NotificationService.send() (save to DB)
      → Broadcast to 'user.{userId}' channel
        → User receives real-time notification
```

---

## 🎓 Additional Resources

- [Laravel Broadcasting Documentation](https://laravel.com/docs/12.x/broadcasting)
- [Laravel Reverb Documentation](https://laravel.com/docs/12.x/reverb)
- [Laravel Echo Documentation](https://laravel.com/docs/12.x/broadcasting#client-side-installation)
- [Pusher Documentation](https://pusher.com/docs)

---

## 💡 Tips

1. **Development:** Gunakan Reverb (gratis, mudah setup)
2. **Production:** Reverb dengan SSL atau Pusher untuk skalabilitas
3. **Debugging:** Aktifkan logging di `config/broadcasting.php`:
   ```php
   'log' => [
       'driver' => 'log',
       'level' => env('LOG_LEVEL', 'debug'),
   ],
   ```
4. **Performance:** Pastikan queue worker running dengan `--tries=3` untuk retry failed jobs
5. **Multiple Workers:** Untuk load tinggi, jalankan multiple queue workers

---

## ❓ FAQ

**Q: Apakah harus running 4 terminal sekaligus?**
A: Ya, untuk development. Untuk production, gunakan process manager seperti Supervisor.

**Q: Apakah Reverb gratis?**
A: Ya, Laravel Reverb adalah open-source dan gratis. Pusher adalah alternatif berbayar.

**Q: Bagaimana cara handle koneksi terputus?**
A: Laravel Echo otomatis reconnect. Jika gagal, reload halaman akan re-establish koneksi.

**Q: Apakah notifikasi akan hilang jika user offline?**
A: Tidak, notifikasi tetap tersimpan di database. Real-time hanya untuk instant delivery saat user online.

**Q: Berapa banyak concurrent connections yang didukung Reverb?**
A: Tergantung server resource. Untuk production, lakukan load testing dan scale sesuai kebutuhan.

---

## 🎉 Conclusion

Setelah mengikuti panduan ini, sistem notifikasi real-time sudah berfungsi! Users akan mendapat notifikasi instant tanpa perlu refresh halaman.

**Happy Coding! 🚀**
