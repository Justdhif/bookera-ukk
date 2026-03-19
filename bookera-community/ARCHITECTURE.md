# 🏛 Frontend Architecture & Packages

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)

**Dokumentasi Lengkap Arsitektur & Package Frontend Bookera**

</div>

---

## 📋 Daftar Isi

- [Struktur Folder](#-struktur-folder)
- [Dependencies](#-dependencies)
- [Routing Architecture](#-routing-architecture)
- [State Management](#-state-management)
- [API Services](#-api-services)
- [Component Structure](#-component-structure)
- [Best Practices](#-best-practices)

---

## 📁 Struktur Folder

```
bookera-web/
├── 📂 src/                          # Source code utama
│   ├── 📂 app/                      # App Router (Next.js 16)
│   │   ├── 📂 (auth)/              # Auth route group
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── layout.tsx
│   │   ├── 📂 (public)/            # Public route group
│   │   │   ├── page.tsx           # Homepage
│   │   │   ├── books/             # Browse books
│   │   │   └── about/
│   │   ├── 📂 admin/               # Admin dashboard
│   │   │   ├── dashboard/
│   │   │   ├── books/
│   │   │   ├── users/
│   │   │   ├── loans/
│   │   │   └── ...
│   │   ├── layout.tsx              # Root layout
│   │   ├── providers.tsx           # Global providers
│   │   └── globals.css             # Global styles
│   │
│   ├── 📂 components/              # React components
│   │   ├── 📂 ui/                  # Shadcn UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── 📂 custom-ui/          # Custom components
│   │   │   ├── navbar.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── book-card.tsx
│   │   │   └── ...
│   │   └── theme-provider.tsx      # Theme provider
│   │
│   ├── 📂 services/                # API service layer
│   │   ├── auth.service.ts         # Authentication
│   │   ├── book.service.ts         # Books management
│   │   ├── user.service.ts         # User management
│   │   ├── loan.service.ts         # Loan management
│   │   ├── notification.service.ts # Notifications
│   │   └── ...
│   │
│   ├── 📂 store/                   # State management (Zustand)
│   │   ├── auth.store.ts           # Auth state
│   │   ├── notification.store.ts   # Notifications state
│   │   └── ...
│   │
│   ├── 📂 hooks/                   # Custom React hooks
│   │   ├── use-auth.ts
│   │   ├── use-toast.ts
│   │   └── ...
│   │
│   ├── 📂 lib/                     # Utility functions
│   │   ├── utils.ts                # General utilities
│   │   ├── api.ts                  # API client setup
│   │   └── validators.ts           # Validation helpers
│   │
│   ├── 📂 types/                   # TypeScript definitions
│   │   ├── index.ts                # Exported types
│   │   ├── api.ts                  # API response types
│   │   └── models.ts               # Data models
│   │
│   ├── 📂 i18n/                    # Internationalization
│   │   ├── request.ts
│   │   └── routing.ts
│   │
│   ├── 📂 assets/                  # Static assets
│   │   ├── images/
│   │   └── fonts/
│   │
│   └── middleware.ts               # Next.js middleware
│
├── 📂 dictionaries/                # Translation files
│   ├── en.json                     # English
│   └── id.json                     # Indonesian
│
├── 📂 public/                      # Public static files
│   ├── favicon.ico
│   └── ...
│
├── 📄 next.config.ts               # Next.js configuration
├── 📄 tailwind.config.ts           # Tailwind CSS config
├── 📄 tsconfig.json                # TypeScript config
├── 📄 components.json              # Shadcn UI config
├── 📄 package.json                 # Dependencies
└── 📄 .env.local                   # Environment variables
```

### Penjelasan Struktur

#### 🎯 `src/app/` - App Router

Next.js 16 menggunakan **App Router** dengan file-based routing. Setiap folder di dalam `app/` menjadi route.

**Route Groups** (folder dengan tanda kurung):
- `(auth)` - Routes untuk authentication (login, register)
- `(public)` - Routes public (homepage, browse books)
- Folder dengan `()` tidak muncul di URL

**Special Files:**
- `layout.tsx` - Layout wrapper untuk child routes
- `page.tsx` - UI untuk route tersebut
- `loading.tsx` - Loading UI
- `error.tsx` - Error UI
- `not-found.tsx` - 404 UI

**Contoh Routing:**
```
app/admin/books/page.tsx     → /admin/books
app/(public)/page.tsx        → /
app/(auth)/login/page.tsx    → /login
```

#### 🧩 `src/components/` - Components

**`ui/`** - Shadcn UI Components
- Pre-built, accessible, customizable components
- Styled with Tailwind CSS
- Copy-paste ke project (bukan NPM package)
- Contoh: Button, Dialog, Input, Select

**`custom-ui/`** - Custom Components
- Components spesifik untuk Bookera
- Reusable business logic components
- Contoh: BookCard, Navbar, Sidebar

#### 🔌 `src/services/` - API Services

Service layer untuk komunikasi dengan backend API. Menggunakan Axios untuk HTTP requests.

**Pattern:**
```typescript
// book.service.ts
export const bookService = {
  getAll: async (params) => {...},
  getById: async (id) => {...},
  create: async (data) => {...},
  update: async (id, data) => {...},
  delete: async (id) => {...},
}
```

**Benefits:**
- Centralized API logic
- Easy to test
- Reusable across components
- Type-safe dengan TypeScript

#### 🗄️ `src/store/` - State Management

Global state menggunakan **Zustand** (lightweight alternative untuk Redux).

**Example Store:**
```typescript
// auth.store.ts
export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null, token: null }),
}))
```

#### 🪝 `src/hooks/` - Custom Hooks

Custom React hooks untuk logic reusability.

**Examples:**
- `useAuth()` - Authentication logic
- `useToast()` - Toast notifications
- `useDebounce()` - Debounce input
- `useLocalStorage()` - LocalStorage sync

#### 🛠️ `src/lib/` - Utilities

Helper functions dan utilities.

**`utils.ts`:**
```typescript
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Merge Tailwind classes
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
```

**`api.ts`:**
- Axios instance configuration
- Request/response interceptors
- Error handling

#### 📝 `src/types/` - TypeScript Types

Type definitions untuk type safety.

**Examples:**
```typescript
// models.ts
export interface Book {
  id: number
  title: string
  author: string
  isbn: string
  // ...
}

export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'officer' | 'member'
}
```

---

## 📦 Dependencies

### Core Dependencies

#### **Next.js 16.1.4**
```json
"next": "16.1.4"
```
**Purpose:** React framework untuk production  
**Features Used:**
- App Router - File-based routing
- Server Components - Improved performance
- Image Optimization - Automatic image optimization
- API Routes - Backend endpoints (jika diperlukan)

**Why Next.js?**
- SEO-friendly dengan SSR/SSG
- Great developer experience
- Production-ready out of the box
- Large ecosystem & community

---

#### **React 19.2.3**
```json
"react": "19.2.3",
"react-dom": "19.2.3"
```
**Purpose:** UI library  
**Latest Features:**
- Server Components
- Concurrent rendering
- Automatic batching
- Improved hooks

---

#### **TypeScript 5.x**
```json
"typescript": "^5"
```
**Purpose:** Type-safe JavaScript  
**Benefits:**
- Catch errors at compile time
- Better IDE autocomplete
- Self-documenting code
- Easier refactoring

---

### UI & Styling

#### **Tailwind CSS 4.x**
```json
"tailwindcss": "^4"
```
**Purpose:** Utility-first CSS framework  
**Why Tailwind?**
- Rapid UI development
- Small bundle size (unused styles purged)
- Consistent design system
- Responsive design made easy

**Example:**
```tsx
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
  Click me
</button>
```

---

#### **Radix UI** (Headless UI Components)
```json
"@radix-ui/react-dialog": "^1.1.15",
"@radix-ui/react-dropdown-menu": "^2.1.16",
"@radix-ui/react-select": "^2.2.6",
// ... dan banyak lagi
```
**Purpose:** Accessible, unstyled UI primitives  
**Features:**
- ♿ Fully accessible (WAI-ARIA compliant)
- ⌨️ Keyboard navigation
- 🎨 Unstyled (style dengan Tailwind)
- 📱 Mobile-friendly

**Used Components:**
- Dialog - Modals
- Dropdown Menu - Menus
- Select - Dropdowns
- Tooltip - Tooltips
- Tabs - Tab interface
- Switch - Toggle switches
- Checkbox - Checkboxes
- Label - Form labels
- Separator - Dividers
- Scroll Area - Custom scrollbars
- Avatar - User avatars
- Popover - Popovers
- Toggle - Toggle buttons

---

#### **Shadcn UI**
```json
"class-variance-authority": "^0.7.1",
"clsx": "^2.1.1",
"tailwind-merge": "^3.4.0"
```
**Purpose:** Beautiful UI components built on Radix UI  
**What is Shadcn?**
- NOT an NPM package
- Components you copy-paste into your project
- Full ownership of code
- Styled dengan Tailwind CSS

**Supporting Libraries:**
- `class-variance-authority` - Component variants
- `clsx` - Conditional className
- `tailwind-merge` - Merge Tailwind classes

---

#### **Lucide React**
```json
"lucide-react": "^0.562.0"
```
**Purpose:** Beautiful & consistent icon library  
**Features:**
- 1000+ icons
- Tree-shakeable (only import yang dipakai)
- Customizable size & color
- Consistent design

**Example:**
```tsx
import { BookOpen, User, Settings } from "lucide-react"

<BookOpen size={24} className="text-blue-500" />
```

---

#### **Next Themes**
```json
"next-themes": "^0.4.6"
```
**Purpose:** Dark mode support  
**Features:**
- Persistent theme selection
- System theme detection
- No flash on page load
- Multiple themes support

---

### Forms & Validation

#### **React Hook Form**
```json
"react-hook-form": "^7.71.1"
```
**Purpose:** Performant form library  
**Why RHF?**
- Minimal re-renders
- Easy validation
- Small bundle size
- Great TypeScript support

**Example:**
```tsx
const { register, handleSubmit } = useForm()

<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register("email")} />
  <button type="submit">Submit</button>
</form>
```

---

#### **Zod**
```json
"zod": "^4.3.5"
```
**Purpose:** Schema validation  
**Features:**
- TypeScript-first
- Composable schemas
- Type inference
- Great error messages

**Example:**
```typescript
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

type Login = z.infer<typeof loginSchema>
```

---

#### **@hookform/resolvers**
```json
"@hookform/resolvers": "^5.2.2"
```
**Purpose:** Connect Zod with React Hook Form  
**Usage:**
```tsx
const form = useForm({
  resolver: zodResolver(loginSchema)
})
```

---

### State Management

#### **Zustand**
```json
"zustand": "^5.0.10"
```
**Purpose:** Lightweight state management  
**Why Zustand over Redux?**
- Simpler API (less boilerplate)
- Smaller bundle size
- No provider needed
- Great TypeScript support

**Example:**
```typescript
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))

// In component
const { count, increment } = useStore()
```

---

### HTTP & API

#### **Axios**
```json
"axios": "^1.13.2"
```
**Purpose:** HTTP client  
**Why Axios over fetch?**
- Automatic JSON transformation
- Request/response interceptors
- Better error handling
- Request cancellation
- Progress tracking

**Example:**
```typescript
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

// Interceptor untuk auth token
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

---

### Real-time

#### **Laravel Echo & Pusher JS**
```json
"laravel-echo": "^2.3.0",
"pusher-js": "^8.4.0"
```
**Purpose:** Real-time WebSocket communication  
**Used For:**
- Real-time notifications
- Live updates
- Chat features

**Example:**
```typescript
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

const echo = new Echo({
  broadcaster: 'reverb',
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
  wsHost: process.env.NEXT_PUBLIC_WEBSOCKET_HOST,
  wsPort: process.env.NEXT_PUBLIC_WEBSOCKET_PORT,
})

// Listen to events
echo.channel('notifications')
  .listen('LoanApproved', (data) => {
    console.log(data)
  })
```

---

### Utilities

#### **Date-fns**
```json
"date-fns": "^4.1.0"
```
**Purpose:** Date manipulation library  
**Why date-fns?**
- Lightweight (vs moment.js)
- Tree-shakeable
- Immutable
- TypeScript support

**Example:**
```typescript
import { format, addDays } from 'date-fns'

format(new Date(), 'dd MMM yyyy') // "15 Feb 2026"
addDays(new Date(), 7) // +7 days
```

---

#### **React Day Picker**
```json
"react-day-picker": "^9.13.0"
```
**Purpose:** Date picker component  
**Features:**
- Accessible
- Customizable
- Range selection
- Locale support

---

#### **Cookies Next**
```json
"cookies-next": "^6.1.1"
```
**Purpose:** Cookie management untuk Next.js  
**Used For:**
- Storing auth tokens
- User preferences
- Server/client compatibility

---

### Charts & Visualization

#### **Recharts**
```json
"recharts": "^3.7.0"
```
**Purpose:** Chart library untuk React  
**Used For:**
- Dashboard statistics
- Analytics visualization
- Reports

**Features:**
- Responsive charts
- Multiple chart types (line, bar, pie, area)
- Animated transitions
- Tooltip support

**Example:**
```tsx
<LineChart data={data}>
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="value" stroke="#8884d8" />
</LineChart>
```

---

### Carousel

#### **Embla Carousel**
```json
"embla-carousel-react": "^8.6.0",
"embla-carousel-autoplay": "^8.6.0"
```
**Purpose:** Lightweight carousel library  
**Features:**
- Touch-friendly
- Smooth animations
- Plugin system
- Autoplay support

**Used For:**
- Featured books carousel
- Image galleries
- Testimonials slider

---

### Internationalization

#### **Next-intl**
```json
"next-intl": "^4.1.0"
```
**Purpose:** i18n untuk Next.js  
**Features:**
- Server & client components support
- Type-safe translations
- Dynamic locale switching
- Number & date formatting

**Example:**
```tsx
// In component
import { useTranslations } from 'next-intl'

const t = useTranslations('common')
t('welcome') // "Selamat datang" (jika locale = id)
```

---

### UI Enhancements

#### **Sonner**
```json
"sonner": "^2.0.7"
```
**Purpose:** Beautiful toast notifications  
**Features:**
- Smooth animations
- Queue management
- Promise support
- Accessible

**Example:**
```tsx
import { toast } from 'sonner'

toast.success('Book saved!')
toast.error('Something went wrong')
toast.promise(saveBook(), {
  loading: 'Saving...',
  success: 'Saved!',
  error: 'Failed',
})
```

---

#### **CMDK**
```json
"cmdk": "^1.1.1"
```
**Purpose:** Command palette component  
**Features:**
- ⌘K command menu
- Fuzzy search
- Keyboard navigation

**Used For:**
- Quick actions menu
- Search functionality

---

### Development Dependencies

#### **ESLint**
```json
"eslint": "^9",
"eslint-config-next": "16.1.4"
```
**Purpose:** Code linting  
**Catches:**
- Code errors
- Style violations
- Best practice violations

---

#### **TW Animate CSS**
```json
"tw-animate-css": "^1.4.0"
```
**Purpose:** Animation utilities untuk Tailwind  
**Provides:**
- Pre-built animation classes
- Easy animations implementation

---

## 🗺️ Routing Architecture

### App Router Structure

Next.js 16 menggunakan **App Router** (bukan Pages Router).

#### **File-based Routing**

```
app/
├── page.tsx                    → /
├── about/page.tsx             → /about
├── books/
│   ├── page.tsx              → /books
│   └── [id]/page.tsx         → /books/123
└── admin/
    ├── page.tsx              → /admin
    └── books/
        ├── page.tsx          → /admin/books
        ├── create/page.tsx   → /admin/books/create
        └── [id]/
            ├── page.tsx      → /admin/books/123
            └── edit/page.tsx → /admin/books/123/edit
```

#### **Dynamic Routes**

Folder dengan `[name]` = dynamic segment:

```tsx
// app/books/[id]/page.tsx
export default function BookDetail({ params }: { params: { id: string } }) {
  return <div>Book ID: {params.id}</div>
}
```

#### **Route Groups**

Folder dengan `(name)` = tidak muncul di URL:

```
app/
├── (public)/
│   ├── page.tsx              → /
│   └── books/page.tsx        → /books
└── (auth)/
    ├── login/page.tsx        → /login
    └── register/page.tsx     → /register
```

#### **Layouts**

`layout.tsx` - Shared layout untuk semua child routes:

```tsx
// app/admin/layout.tsx
export default function AdminLayout({ children }) {
  return (
    <div>
      <AdminSidebar />
      <main>{children}</main>
    </div>
  )
}
```

#### **Middleware**

File `middleware.ts` di root untuk route protection:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return NextResponse.next()
}
```

---

## 🗄️ State Management

### Zustand Stores

#### **Auth Store**
```typescript
// store/auth.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  token: string | null
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage', // localStorage key
    }
  )
)
```

#### **Notification Store**
```typescript
// store/notification.store.ts
export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  markAsRead: (id) => {
    // ... logic
  },
}))
```

---

## 🔌 API Services

### Service Pattern

Semua API calls diorganisir dalam services:

```typescript
// services/book.service.ts
import { api } from '@/lib/api'
import type { Book, PaginatedResponse } from '@/types'

export const bookService = {
  // Get all books with pagination
  getAll: async (params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<PaginatedResponse<Book>> => {
    const response = await api.get('/books', { params })
    return response.data
  },

  // Get single book
  getById: async (id: number): Promise<Book> => {
    const response = await api.get(`/books/${id}`)
    return response.data.data
  },

  // Create book
  create: async (data: FormData): Promise<Book> => {
    const response = await api.post('/books', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data.data
  },

  // Update book
  update: async (id: number, data: FormData): Promise<Book> => {
    const response = await api.post(`/books/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data.data
  },

  // Delete book
  delete: async (id: number): Promise<void> => {
    await api.delete(`/books/${id}`)
  },
}
```

### API Client Setup

```typescript
// lib/api.ts
import axios from 'axios'
import { getCookie } from 'cookies-next'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor - Add auth token
api.interceptors.request.use((config) => {
  const token = getCookie('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Logout user
      deleteCookie('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

---

## 🧩 Component Structure

### Component Categories

#### **1. UI Components** (`components/ui/`)
- Basic building blocks
- From Shadcn UI
- Highly reusable
- Examples: Button, Input, Dialog

#### **2. Custom UI Components** (`components/custom-ui/`)
- Business logic components
- Specific to Bookera
- Compose multiple UI components
- Examples: BookCard, Navbar, Sidebar

#### **3. Page Components** (`app/.../page.tsx`)
- Top-level route components
- Fetch data
- Compose custom components

### Component Example

```tsx
// components/custom-ui/book-card.tsx
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'
import Image from 'next/image'
import type { Book } from '@/types'

interface BookCardProps {
  book: Book
  onBorrow?: (book: Book) => void
}

export function BookCard({ book, onBorrow }: BookCardProps) {
  return (
    <Card className="p-4">
      <Image
        src={book.cover_url}
        alt={book.title}
        width={200}
        height={300}
        className="rounded-lg"
      />
      <h3 className="font-semibold mt-2">{book.title}</h3>
      <p className="text-sm text-muted-foreground">{book.author}</p>
      <Button onClick={() => onBorrow?.(book)} className="w-full mt-4">
        <BookOpen className="mr-2 h-4 w-4" />
        Pinjam
      </Button>
    </Card>
  )
}
```

---

## ✨ Best Practices

### 1. **Component Organization**

**❌ Bad:**
```tsx
// All in one file
export default function Page() {
  const [books, setBooks] = useState([])
  // 500 lines of code...
}
```

**✅ Good:**
```tsx
// Separate concerns
// List component
export function BookList({ books }) { ... }

// Card component
export function BookCard({ book }) { ... }

// Page component
export default function BooksPage() {
  return <BookList books={books} />
}
```

### 2. **Type Safety**

**❌ Bad:**
```tsx
function BookCard({ book }: any) { ... }
```

**✅ Good:**
```tsx
import type { Book } from '@/types'

function BookCard({ book }: { book: Book }) { ... }
```

### 3. **Error Handling**

**❌ Bad:**
```tsx
const data = await bookService.getAll()
setBooks(data)
```

**✅ Good:**
```tsx
try {
  const data = await bookService.getAll()
  setBooks(data)
} catch (error) {
  toast.error('Failed to load books')
  console.error(error)
}
```

### 4. **Loading States**

**❌ Bad:**
```tsx
// No loading indicator
const books = await bookService.getAll()
```

**✅ Good:**
```tsx
const [loading, setLoading] = useState(true)

useEffect(() => {
  fetchBooks().finally(() => setLoading(false))
}, [])

if (loading) return <Skeleton />
```

### 5. **Server vs Client Components**

**Use Server Components for:**
- Data fetching
- Static content
- SEO important content

**Use Client Components for:**
- Interactivity (onClick, onChange)
- Browser APIs (localStorage, window)
- React hooks (useState, useEffect)

```tsx
// Client component (has interactivity)
'use client'

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### 6. **Code Splitting**

Use dynamic imports untuk large components:

```tsx
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('./chart'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // Disable SSR for this component
})
```

---

## 📚 Additional Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com)

### Tutorials
- [Next.js Learn](https://nextjs.org/learn)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app)

---

## 📝 Next Steps

Lanjutkan ke dokumentasi lainnya:

1. **[Configuration Guide](./CONFIGURATION.md)** - Setup & konfigurasi
2. **[Backend Configuration](../bookera-api/CONFIGURATION.md)** - Setup backend
3. **[Backend Architecture](../bookera-api/ARCHITECTURE.md)** - Arsitektur backend

---

<div align="center">

**Questions?** Open an issue on [GitHub](https://github.com/yourusername/bookera/issues)

Made with ❤️ by Nadhif A.W

</div>
