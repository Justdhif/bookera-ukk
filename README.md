<div align="center">

![Bookera Logo](./assets/logo/bookera-logo.png)

# 📚 Bookera - Modern Library Management System

[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

**Sistem manajemen perpustakaan modern yang powerful, intuitif, dan mudah digunakan**

[Fitur](#-fitur-utama) • [Teknologi](#-teknologi-yang-digunakan) • [Instalasi](#-quick-start) • [Dokumentasi](#-dokumentasi) • [Demo](#-demo)

</div>

---

## 🌟 Tentang Bookera

Bookera adalah sistem manajemen perpustakaan modern yang dibangun dengan teknologi terkini untuk memberikan pengalaman terbaik dalam pengelolaan koleksi buku, peminjaman, dan pengembalian. Sistem ini dirancang untuk perpustakaan sekolah, universitas, maupun institusi lainnya.

### Mengapa Bookera?

- ✨ **Antarmuka Modern** - UI/UX yang bersih dan intuitif
- 🚀 **Performa Tinggi** - Dibangun dengan teknologi modern dan scalable
- 🔐 **Keamanan Terjamin** - Autentikasi dan autorisasi yang robust
- 📱 **Responsive Design** - Bekerja sempurna di semua perangkat
- 🌐 **Multi-bahasa** - Mendukung Bahasa Indonesia dan Inggris
- 🔔 **Notifikasi Real-time** - Update instant menggunakan WebSocket
- 📊 **Dashboard Analytics** - Visualisasi data yang informatif

---

## 🎯 Fitur Utama

### Untuk Administrator
- 📚 Manajemen koleksi buku lengkap (CRUD)
- 👥 Manajemen pengguna dan hak akses
- 📊 Dashboard analytics dan reporting
- 🔍 Sistem pencarian dan filtering advanced
- 📋 Manajemen kategori dan genre
- 💰 Sistem denda otomatis
- 📈 Laporan statistik peminjaman

### Untuk Petugas
- ✅ Persetujuan peminjaman dan pengembalian
- 📖 Monitoring status buku
- 🔔 Notifikasi real-time
- 📝 Log aktivitas lengkap
- 🚨 Laporan buku hilang

### Untuk Anggota
- 🔍 Pencarian dan browsing koleksi buku
- 📖 Request peminjaman buku
- 📚 Riwayat peminjaman
- 🔔 Notifikasi status peminjaman
- 👤 Manajemen profil pribadi
- ⭐ Wishlist buku favorit

---

## 🛠 Teknologi yang Digunakan

### Backend
- **Laravel 12** - PHP Framework modern dan powerful
- **MySQL** - Database relational
- **Laravel Reverb** - Real-time WebSocket server
- **Laravel Sanctum** - API authentication
- **Intervention Image** - Image processing

### Frontend
- **Next.js 16** - React framework untuk production
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful & accessible UI components
- **Zustand** - State management
- **React Hook Form** - Form validation
- **Pusher/Laravel Echo** - Real-time notifications

---

## 🚀 Quick Start

### Prerequisites

Pastikan Anda telah menginstall:
- **PHP** >= 8.2
- **Composer** >= 2.x
- **Node.js** >= 18.x
- **NPM** atau **Yarn**
- **MySQL** >= 8.x

### Instalasi Cepat

```bash
# Clone repository
git clone https://github.com/yourusername/bookera.git
cd bookera

# Setup Backend
cd bookera-api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link

# Setup Frontend
cd ../bookera-web
npm install
cp .env.example .env.local

# Jalankan aplikasi
# Terminal 1 (Backend)
cd bookera-api
php artisan serve

# Terminal 2 (Queue Worker)
php artisan queue:work

# Terminal 3 (WebSocket)
php artisan reverb:start

# Terminal 4 (Frontend)
cd bookera-web
npm run dev
```

Akses aplikasi di:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000

### Default Credentials

```
Admin:
Email: admin@bookera.com
Password: admin123

Petugas:
Email: officer@bookera.com
Password: officer123

Anggota:
Email: member@bookera.com
Password: member123
```

---

## 📚 Dokumentasi

Dokumentasi lengkap untuk setiap bagian dari sistem tersedia di:

### 🌐 Frontend Documentation
- **[Configuration Guide](./bookera-web/CONFIGURATION.md)** - Panduan konfigurasi lengkap untuk frontend
- **[Architecture & Packages](./bookera-web/ARCHITECTURE.md)** - Struktur folder dan penjelasan package

### ⚙️ Backend Documentation
- **[Configuration Guide](./bookera-api/CONFIGURATION.md)** - Panduan konfigurasi lengkap untuk backend
- **[Architecture & Packages](./bookera-api/ARCHITECTURE.md)** - Struktur folder dan penjelasan package

### 🔔 Additional Documentation
- **[Real-time Notifications Setup](./REALTIME_NOTIFICATIONS_SETUP.md)** - Setup notifikasi real-time

---

## 🎨 Demo

### Screenshots

<div align="center">
  <img src="./assets/demo/dashboard.png" alt="Dashboard" width="400">
  <img src="./assets/demo/books.png" alt="Books Management" width="400">
  <p><i>Dashboard Admin dan Manajemen Buku</i></p>
</div>

---

## 📁 Struktur Proyek

```
bookera/
├── 📂 bookera-api/          # Laravel Backend API
│   ├── app/                 # Application logic
│   ├── config/              # Configuration files
│   ├── database/            # Migrations & seeders
│   ├── routes/              # API routes
│   └── ...
│
├── 📂 bookera-web/          # Next.js Frontend
│   ├── src/                 # Source code
│   │   ├── app/            # App router pages
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── store/          # State management
│   └── ...
│
└── 📂 assets/               # Static assets
    ├── logo/               # Logo files
    └── demo/               # Demo screenshots
```

---

## 🔧 Development

### Backend Development

```bash
cd bookera-api

# Run development server dengan hot reload
composer dev

# Run tests
composer test

# Code formatting
./vendor/bin/pint
```

### Frontend Development

```bash
cd bookera-web

# Run development server
npm run dev

# Build untuk production
npm run build

# Run linter
npm run lint
```

---

## 🤝 Contributing

Kami menyambut kontribusi dari siapa saja! Jika Anda ingin berkontribusi:

1. Fork repository ini
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Author

**Nadhif A.W**

- GitHub: [@nadhifaw](https://github.com/nadhifaw)
- Email: nadhif@example.com

---

## 🙏 Acknowledgments

- [Laravel](https://laravel.com) - The PHP Framework for Web Artisans
- [Next.js](https://nextjs.org) - The React Framework for Production
- [Shadcn/ui](https://ui.shadcn.com) - Beautifully designed components
- [Tailwind CSS](https://tailwindcss.com) - A utility-first CSS framework

---

<div align="center">

**⭐ Jika project ini membantu, jangan lupa berikan star!**

Made with ❤️ by Nadhif A.W

</div>
