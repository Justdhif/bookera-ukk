# ⚙️ Frontend Configuration Guide

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)

**Panduan Lengkap Konfigurasi Frontend Bookera**

</div>

---

## 📋 Daftar Isi

- [Prerequisites](#-prerequisites)
- [Instalasi](#-instalasi)
- [Environment Variables](#-environment-variables)
- [Konfigurasi](#%EF%B8%8F-konfigurasi)
- [Development](#-development)
- [Build & Deployment](#-build--deployment)
- [Troubleshooting](#-troubleshooting)

---

## 🔧 Prerequisites

Sebelum memulai, pastikan sistem Anda telah memenuhi requirement berikut:

### System Requirements

| Software | Versi Minimum | Rekomendasi | Cara Install |
|----------|---------------|-------------|--------------|
| **Node.js** | 18.17.x | 20.x atau lebih | [nodejs.org](https://nodejs.org) |
| **NPM** | 9.x | 10.x atau lebih | Terinstall dengan Node.js |
| **Yarn** | 1.22.x | Latest | `npm install -g yarn` (opsional) |
| **Git** | 2.x | Latest | [git-scm.com](https://git-scm.com) |

### Cek Versi

```bash
# Cek versi Node.js
node --version

# Cek versi NPM
npm --version

# Cek versi Yarn (jika menggunakan Yarn)
yarn --version
```

---

## 📦 Instalasi

### 1. Clone Repository

```bash
# Clone dari Git
git clone https://github.com/yourusername/bookera.git

# Masuk ke direktori frontend
cd bookera/bookera-web
```

### 2. Install Dependencies

**Menggunakan NPM:**
```bash
npm install
```

**Menggunakan Yarn:**
```bash
yarn install
```

### 3. Setup Environment Variables

```bash
# Copy file .env.example ke .env.local
cp .env.example .env.local

# Atau di Windows:
copy .env.example .env.local
```

Kemudian edit file `.env.local` sesuai kebutuhan Anda.

---

## 🔐 Environment Variables

Environment variables digunakan untuk menyimpan konfigurasi sensitif seperti API URLs, keys, dan secrets. File `.env.local` **tidak akan** di-commit ke repository untuk keamanan.

### File Environment

| File | Deskripsi | Di-commit? |
|------|-----------|------------|
| `.env.example` | Template environment variables | ✅ Ya |
| `.env.local` | Environment untuk development lokal | ❌ Tidak |
| `.env.production` | Environment untuk production | ❌ Tidak |

### Environment Variables yang Tersedia

Buat file `.env.local` di root folder `bookera-web` dengan konfigurasi berikut:

```bash
# ===========================================
# API CONFIGURATION
# ===========================================
# URL backend API Laravel
# Development: http://localhost:8000
# Production: https://api.bookera.com
NEXT_PUBLIC_API_URL=http://localhost:8000

# Base URL untuk API routes
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api


# ===========================================
# WEBSOCKET CONFIGURATION (Real-time)
# ===========================================
# Pusher/Reverb credentials untuk real-time notifications
NEXT_PUBLIC_PUSHER_APP_KEY=your-pusher-app-key
NEXT_PUBLIC_PUSHER_APP_CLUSTER=mt1

# WebSocket host (Laravel Reverb)
NEXT_PUBLIC_WEBSOCKET_HOST=localhost
NEXT_PUBLIC_WEBSOCKET_PORT=8080
NEXT_PUBLIC_WEBSOCKET_SCHEME=http


# ===========================================
# APPLICATION CONFIGURATION
# ===========================================
# Bahasa default aplikasi (id | en)
NEXT_PUBLIC_DEFAULT_LOCALE=id

# Mode development/production
NODE_ENV=development


# ===========================================
# STORAGE CONFIGURATION
# ===========================================
# Base URL untuk mengakses file storage (gambar, dokumen)
NEXT_PUBLIC_STORAGE_URL=http://localhost:8000/storage


# ===========================================
# PAGINATION CONFIGURATION
# ===========================================
# Jumlah item per halaman default
NEXT_PUBLIC_DEFAULT_PAGE_SIZE=10


# ===========================================
# THEME CONFIGURATION
# ===========================================
# Default theme (light | dark | system)
NEXT_PUBLIC_DEFAULT_THEME=system
```

### Penjelasan Detail Environment Variables

#### 🌐 API Configuration

**`NEXT_PUBLIC_API_URL`**
- **Deskripsi**: URL dasar backend API Laravel
- **Development**: `http://localhost:8000`
- **Production**: URL domain API production Anda
- **Penting**: Harus HTTPS di production untuk keamanan

**`NEXT_PUBLIC_API_BASE_URL`**
- **Deskripsi**: URL lengkap dengan prefix `/api`
- **Contoh**: `http://localhost:8000/api`
- **Digunakan**: Untuk semua API calls

#### 📡 WebSocket Configuration

**`NEXT_PUBLIC_PUSHER_APP_KEY`**
- **Deskripsi**: Application key dari Pusher/Reverb
- **Cara mendapatkan**: 
  - Cek di file `.env` backend Laravel
  - Atau register di [pusher.com](https://pusher.com) untuk Pusher
- **Contoh**: `abc123def456`

**`NEXT_PUBLIC_WEBSOCKET_HOST`**
- **Deskripsi**: Host untuk WebSocket server
- **Development**: `localhost`
- **Production**: Domain server Anda (tanpa protocol)

**`NEXT_PUBLIC_WEBSOCKET_PORT`**
- **Deskripsi**: Port WebSocket server (Laravel Reverb default: 8080)
- **Development**: `8080`
- **Production**: Sesuaikan dengan konfigurasi server

#### 🌍 Application Configuration

**`NEXT_PUBLIC_DEFAULT_LOCALE`**
- **Deskripsi**: Bahasa default aplikasi
- **Options**: `id` (Indonesia) | `en` (English)
- **Default**: `id`

**`NODE_ENV`**
- **Deskripsi**: Environment mode
- **Options**: `development` | `production`
- **Auto-set**: Otomatis ter-set saat build

#### 📁 Storage Configuration

**`NEXT_PUBLIC_STORAGE_URL`**
- **Deskripsi**: URL untuk mengakses file storage (cover buku, avatar, dll)
- **Development**: `http://localhost:8000/storage`
- **Production**: URL storage production Anda
- **Note**: Pastikan `php artisan storage:link` sudah dijalankan di backend

---

## ⚙️ Konfigurasi

### Next.js Configuration

File konfigurasi utama Next.js terletak di [`next.config.ts`](./next.config.ts).

```typescript
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Aktifkan compiler optimizations
  reactStrictMode: true,
  
  // Konfigurasi image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
    ],
  },
  
  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default withNextIntl(nextConfig);
```

#### Penjelasan Konfigurasi:

**`reactStrictMode`**
- Mengaktifkan mode strict React untuk mendeteksi potential problems
- Direkomendasikan untuk development

**`images.remotePatterns`**
- Whitelist domain untuk Next.js Image Optimization
- Tambahkan domain production saat deploy
- Contoh tambahan:
  ```typescript
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'api.bookera.com',
      pathname: '/storage/**',
    },
  ]
  ```

**`experimental.optimizePackageImports`**
- Optimasi import untuk package tertentu
- Mengurangi bundle size
- `lucide-react` di-optimize untuk hanya import icon yang digunakan

### TypeScript Configuration

File [`tsconfig.json`](./tsconfig.json) mengatur TypeScript compiler:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Highlight:**
- `"strict": true` - Type-checking ketat untuk kode yang lebih aman
- `"paths"` - Path alias `@/*` untuk import yang lebih bersih
- Contoh: `import Button from "@/components/ui/button"`

### Tailwind CSS Configuration

File [`postcss.config.mjs`](./postcss.config.mjs) untuk CSS processing:

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

### ESLint Configuration

File [`eslint.config.mjs`](./eslint.config.mjs) untuk code linting:

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
```

### Internationalization (i18n) Configuration

File [`next-i18next.config.js`](./next-i18next.config.js):

```javascript
module.exports = {
  i18n: {
    defaultLocale: 'id',
    locales: ['en', 'id'],
  },
}
```

**Lokasi file dictionary:**
- Indonesian: [`dictionaries/id.json`](./dictionaries/id.json)
- English: [`dictionaries/en.json`](./dictionaries/en.json)

---

## 🚀 Development

### Menjalankan Development Server

```bash
# Menggunakan NPM
npm run dev

# Menggunakan Yarn
yarn dev
```

Server akan berjalan di **http://localhost:3000**

#### Features Development Mode:

- ⚡ **Fast Refresh** - Changes langsung terlihat tanpa full reload
- 🔍 **Error Overlay** - Error ditampilkan langsung di browser
- 📊 **Performance Metrics** - Web Vitals tracking
- 🎯 **TypeScript Checking** - Type errors ditampilkan real-time

### Development Workflow

1. **Jalankan Backend API** (di terminal terpisah)
   ```bash
   cd bookera-api
   php artisan serve
   php artisan queue:work
   php artisan reverb:start
   ```

2. **Jalankan Frontend**
   ```bash
   cd bookera-web
   npm run dev
   ```

3. **Open Browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

### Available Scripts

| Script | Command | Deskripsi |
|--------|---------|-----------|
| **dev** | `npm run dev` | Run development server |
| **build** | `npm run build` | Build production bundle |
| **start** | `npm run start` | Run production server |
| **lint** | `npm run lint` | Run ESLint |

---

## 🏗 Build & Deployment

### Build untuk Production

```bash
# Build aplikasi
npm run build

# Test production build locally
npm run start
```

#### Build Process:

1. **Type Checking** - TypeScript compilation
2. **Linting** - ESLint checks
3. **Optimization** - Code splitting & minification
4. **Static Generation** - Pre-render pages
5. **Asset Optimization** - Image & font optimization

### Output Build

```
.next/
├── cache/           # Build cache
├── server/          # Server files
├── static/          # Static assets
└── ...
```

### Deployment Options

#### 1. Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

**Environment Variables di Vercel:**
- Buka project dashboard
- Settings → Environment Variables
- Tambahkan semua environment variables production

#### 2. Custom Server (VPS/Cloud)

**Menggunakan PM2:**

```bash
# Install PM2
npm install -g pm2

# Build aplikasi
npm run build

# Start dengan PM2
pm2 start npm --name "bookera-web" -- start

# Auto-start on reboot
pm2 startup
pm2 save
```

**Menggunakan Docker:**

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build & Run:
```bash
docker build -t bookera-web .
docker run -p 3000:3000 bookera-web
```

#### 3. Static Export (Optional)

Untuk hosting static (tidak semua fitur tersedia):

```bash
# Update next.config.ts
output: 'export'

# Build
npm run build
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Port 3000 sudah digunakan

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Windows - Find & kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti :3000 | xargs kill -9

# Atau gunakan port lain
npm run dev -- -p 3001
```

#### 2. Module not found

**Error:**
```
Module not found: Can't resolve '...'
```

**Solution:**
```bash
# Hapus node_modules dan reinstall
rm -rf node_modules package-lock.json
npm install

# Atau hapus cache Next.js
rm -rf .next
npm run dev
```

#### 3. Type errors

**Error:**
```
Type error: Cannot find module '@/...'
```

**Solution:**
```bash
# Restart TypeScript server di VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"

# Atau cek tsconfig.json paths
```

#### 4. WebSocket connection failed

**Error:**
```
WebSocket connection to 'ws://localhost:8080' failed
```

**Solution:**
```bash
# Pastikan Laravel Reverb berjalan
cd bookera-api
php artisan reverb:start

# Cek environment variables
NEXT_PUBLIC_WEBSOCKET_HOST=localhost
NEXT_PUBLIC_WEBSOCKET_PORT=8080
```

#### 5. API calls gagal (CORS)

**Error:**
```
Access to fetch at '...' has been blocked by CORS policy
```

**Solution:**
- Cek konfigurasi CORS di backend Laravel
- File: `bookera-api/config/cors.php`
- Pastikan frontend URL ada di `allowed_origins`

#### 6. Images tidak tampil

**Problem:** Image dari backend tidak loading

**Solution:**
1. Cek `next.config.ts` - pastikan domain ada di `remotePatterns`
2. Cek `NEXT_PUBLIC_STORAGE_URL` di `.env.local`
3. Pastikan `php artisan storage:link` sudah dijalankan di backend

### Development Tips

#### Hot Reload tidak bekerja

```bash
# Windows - Increase file watcher limit
# Add to package.json scripts:
"dev": "next dev --turbo"

# Linux - Increase inotify watchers
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

#### Clear All Caches

```bash
# Hapus semua cache
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

#### Performance Issues

```bash
# Gunakan Turbopack (Next.js 15+)
npm run dev --turbo

# Disable TypeScript checking saat dev (temporarily)
# next.config.ts
typescript: {
  ignoreBuildErrors: true
}
```

---

## 📚 Additional Resources

### Official Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com)

### Learning Resources

- [Next.js Learn Course](https://nextjs.org/learn)
- [TypeScript for React Developers](https://react-typescript-cheatsheet.netlify.app)
- [Tailwind CSS Tutorial](https://tailwindcss.com/docs/utility-first)

### Community & Support

- [Next.js GitHub Discussions](https://github.com/vercel/next.js/discussions)
- [Next.js Discord](https://nextjs.org/discord)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)

---

## 📝 Next Steps

Setelah selesai konfigurasi, lanjutkan ke:

1. **[Architecture & Packages Guide](./ARCHITECTURE.md)** - Pelajari struktur folder dan package yang digunakan
2. **[Backend Configuration](../bookera-api/CONFIGURATION.md)** - Setup backend API
3. **[Backend Architecture](../bookera-api/ARCHITECTURE.md)** - Pelajari struktur backend

---

<div align="center">

**Butuh bantuan?** Buka issue di [GitHub Repository](https://github.com/yourusername/bookera/issues)

Made with ❤️ by Nadhif A.W

</div>
