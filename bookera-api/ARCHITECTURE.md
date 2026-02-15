# 🏛 Backend Architecture & Packages

<div align="center">

![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=flat-square&logo=laravel&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4?style=flat-square&logo=php&logoColor=white)

**Dokumentasi Lengkap Arsitektur & Package Backend Bookera**

</div>

---

## 📋 Daftar Isi

- [Struktur Folder](#-struktur-folder)
- [Dependencies](#-dependencies)
- [Database Architecture](#-database-architecture)
- [API Architecture](#-api-architecture)
- [Authentication & Authorization](#-authentication--authorization)
- [Real-time Broadcasting](#-real-time-broadcasting)
- [Best Practices](#-best-practices)

---

## 📁 Struktur Folder

```
bookera-api/
├── 📂 app/                          # Application code
│   ├── 📂 Console/                  # Artisan commands
│   │   └── Commands/
│   │
│ ├── 📂 Events/                 # Event classes
│   │   ├── LoanRequested.php       # Event: Loan requested
│   │   ├── LoanApproved.php        # Event: Loan approved
│   │   ├── LoanRejected.php        # Event: Loan rejected
│   │   ├── ReturnRequested.php     # Event: Return requested
│   │   ├── ReturnApproved.php      # Event: Return approved
│   │   ├── FineCreated.php         # Event: Fine created
│   │   └── LostBookReported.php    # Event: Lost book reported
│   │
│   ├── 📂 Listeners/                # Event listeners
│   │   ├── LogLoginActivity.php
│   │   ├── LogLogoutActivity.php
│   │   └── ...
│   │
│   ├── 📂 Models/                   # Eloquent models
│   │   ├── User.php                # User model
│   │   ├── UserProfile.php         # User profile
│   │   ├── Book.php                # Book model
│   │   ├── BookCopy.php            # Physical book copy
│   │   ├── Category.php            # Book category
│   │   ├── Loan.php                # Loan transaction
│   │   ├── LoanDetail.php          # Loan detail
│   │   ├── BookReturn.php          # Return transaction
│   │   ├── BookReturnDetail.php    # Return detail
│   │   ├── Fine.php                # Fine transaction
│   │   ├── FineType.php            # Fine type (late, lost, etc)
│   │   ├── LostBook.php            # Lost book report
│   │   ├── Save.php                # Wishlist/Collection
│   │   ├── SaveItem.php            # Wishlist items
│   │   ├── Notification.php        # Notifications
│   │   ├── ActivityLog.php         # Activity logs
│   │   ├── ContentPage.php         # CMS pages
│   │   ├── TermsOfService.php      # Terms of service
│   │   └── PrivacyPolicy.php       # Privacy policy
│   │
│   ├── 📂 Http/                     # HTTP layer
│   │   ├── 📂 Controllers/
│   │   │   ├── Controller.php      # Base controller
│   │   │   └── 📂 Api/             # API controllers
│   │   │       ├── AuthController.php
│   │   │       ├── UserController.php
│   │   │       ├── BookController.php
│   │   │       ├── BookCopyController.php
│   │   │       ├── CategoryController.php
│   │   │       ├── LoanController.php
│   │   │       ├── BookReturnController.php
│   │   │       ├── ApprovalController.php
│   │   │       ├── FineController.php
│   │   │       ├── FineTypeController.php
│   │   │       ├── LostBookController.php
│   │   │       ├── SaveController.php
│   │   │       ├── NotificationController.php
│   │   │       ├── ActivityController.php
│   │   │       ├── DashboardController.php
│   │   │       ├── ContentPageController.php
│   │   │       ├── TermsOfServiceController.php
│   │   │       └── PrivacyPolicyController.php
│   │   │
│   │   ├── 📂 Middleware/          # HTTP middleware
│   │   │   ├── Authenticate.php
│   │   │   ├── EnsureUserIsAdmin.php
│   │   │   └── ...
│   │   │
│   │   └── 📂 Requests/            # Form request validation
│   │       ├── LoginRequest.php
│   │       ├── RegisterRequest.php
│   │       ├── BookRequest.php
│   │       └── ...
│   │
│   ├── 📂 Helpers/                  # Helper classes & functions
│   │   ├── helpers.php             # Global helper functions
│   │   ├── ApiResponse.php         # Standardized API responses
│   │   ├── ActivityLogger.php      # Activity logging
│   │   ├── ImageHelper.php         # Image processing
│   │   ├── AvatarHelper.php        # Avatar generation
│   │   ├── SaveCoverHelper.php     # Cover image helper
│   │   └── SlugGenerator.php       # Slug generation
│   │
│   ├── 📂 Services/                 # Business logic services
│   │   └── ...
│   │
│   └── 📂 Providers/                # Service providers
│       ├── AppServiceProvider.php
│       ├── AuthServiceProvider.php
│       ├── EventServiceProvider.php
│       └── RouteServiceProvider.php
│
├── 📂 bootstrap/                    # Bootstrap files
│   ├── app.php                     # Application bootstrap
│   ├── providers.php               # Provider registration
│   └── cache/                      # Bootstrap cache
│
├── 📂 config/                       # Configuration files
│   ├── app.php                     # Application config
│   ├── auth.php                    # Authentication config
│   ├── database.php                # Database config
│   ├── filesystems.php             # Storage config
│   ├── mail.php                    # Mail config
│   ├── queue.php                   # Queue config
│   ├── broadcasting.php            # Broadcasting config
│   ├── reverb.php                  # Reverb WebSocket config
│   ├── sanctum.php                 # Sanctum API auth config
│   └── ...
│
├── 📂 database/                     # Database files
│   ├── 📂 migrations/              # Database migrations
│   │   ├── 0001_01_01_000000_create_users_table.php
│   │   ├── 2026_01_22_022614_create_books_table.php
│   │   ├── 2026_01_22_023259_create_book_copies_table.php
│   │   ├── 2026_01_22_023528_create_categories_table.php
│   │   ├── 2026_01_22_023534_create_loans_table.php
│   │   └── ...
│   │
│   ├── 📂 seeders/                 # Database seeders
│   │   ├── DatabaseSeeder.php      # Main seeder
│   │   ├── UserSeeder.php          # Users seed
│   │   ├── CategorySeeder.php      # Categories seed
│   │   ├── BookSeeder.php          # Books seed
│   │   └── ...
│   │
│   └── 📂 factories/               # Model factories
│       ├── UserFactory.php
│       ├── BookFactory.php
│       └── ...
│
├── 📂 routes/                       # Route definitions
│   ├── web.php                     # Web routes
│   ├── api.php                     # API routes
│   ├── console.php                 # Console commands
│   └── channels.php                # Broadcasting channels
│
├── 📂 storage/                      # File storage
│   ├── 📂 app/                     # Application storage
│   │   ├── public/                # Public files
│   │   │   ├── avatars/           # User avatars
│   │   │   ├── book-covers/       # Book covers
│   │   │   └── documents/         # Documents
│   │   └── private/               # Private files
│   ├── 📂 framework/               # Framework files
│   └── 📂 logs/                    # Log files
│
├── 📂 tests/                        # Test files
│   ├── Feature/                    # Feature tests
│   ├── Unit/                       # Unit tests
│   └── TestCase.php                # Base test case
│
├── 📂 public/                       # Public directory
│   ├── index.php                   # Entry point
│   ├── storage/                    # Symlink to storage/app/public
│   └── robots.txt
│
├── 📄 .env.example                  # Environment template
├── 📄 composer.json                 # PHP dependencies
├── 📄 package.json                  # Node dependencies (Vite)
├── 📄 artisan                       # Artisan CLI
└── 📄 phpunit.xml                   # PHPUnit config
```

---

## 📦 Dependencies

### Core Dependencies

#### **Laravel Framework 12.x**
```json
"laravel/framework": "^12.0"
```
**Purpose:** PHP web application framework  
**Why Laravel?**
- 🚀 Modern PHP framework
- 📦 Rich ecosystem
- 🛠 Built-in tools (ORM, Queue, Cache, etc)
- 🔐 Security features
- 📚 Excellent documentation

**Key Features Used:**
- **Eloquent ORM** - Database interactions
- **Migrations** - Database version control
- **Validation** - Request validation
- **Queue System** - Async job processing
- **Broadcasting** - Real-time events
- **File Storage** - File management
- **Authentication** - User authentication

---

#### **Laravel Sanctum 4.x**
```json
"laravel/sanctum": "^4.2"
```
**Purpose:** API authentication  
**Features:**
- Token-based authentication
- SPA authentication
- Mobile app authentication
- Simple & lightweight

**How it works:**
1. User login → generate token
2. Frontend stores token
3. Include token in API requests
4. Laravel verifies token

**Example:**
```php
// Login - generate token
$token = $user->createToken('auth-token')->plainTextToken;

// Protect routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [UserController::class, 'profile']);
});
```

---

#### **Laravel Reverb 1.x**
```json
"laravel/reverb": "^1.7"
```
**Purpose:** Self-hosted WebSocket server  
**Why Reverb?**
- ✅ Free & open-source
- ✅ Self-hosted (no third-party)
- ✅ Built specifically for Laravel
- ✅ Easy setup

**Used For:**
- Real-time notifications
- Live updates
- Broadcasting events

**Alternative:** Pusher (commercial), Ably, Socket.io

---

#### **Laravel Tinker 2.x**
```json
"laravel/tinker": "^2.10.1"
```
**Purpose:** Interactive REPL (Read-Eval-Print Loop)  
**Usage:**
```bash
php artisan tinker

# Test code interactively
>>> $user = User::find(1)
>>> $user->name
>>> Book::count()
```

**Great for:**
- Testing code snippets
- Database queries
- Debugging

---

### Image Processing

#### **Intervention Image 3.x**
```json
"intervention/image": "^3.11"
```
**Purpose:** Image manipulation library  
**Features:**
- Resize images
- Crop images
- Apply filters
- Generate thumbnails
- Convert formats

**Used For:**
- Book cover optimization
- Avatar generation
- Thumbnail creation

**Example:**
```php
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

$manager = new ImageManager(new Driver());
$image = $manager->read('photo.jpg');
$image->resize(300, 200);
$image->save('thumb.jpg');
```

**Why Intervention over native PHP?**
- Easier API
- More features
- Better quality
- Automatic optimization

---

### Development Dependencies

#### **Laravel Pail 1.x**
```json
"laravel/pail": "^1.2.2"
```
**Purpose:** Beautiful log viewer  
**Usage:**
```bash
php artisan pail
```

**Features:**
- Real-time log watching
- Colored output
- Filter by level (info, error, debug)
- Better than `tail -f`

---

#### **Laravel Pint 1.x**
```json
"laravel/pint": "^1.24"
```
**Purpose:** Code style formatter  
**Usage:**
```bash
# Format all files
./vendor/bin/pint

# Check without fixing
./vendor/bin/pint --test
```

**Features:**
- Automatic code formatting
- PSR-12 standard
- Zero configuration
- Laravel-specific rules

---

#### **Laravel Sail 1.x**
```json
"laravel/sail": "^1.41"
```
**Purpose:** Docker development environment  
**Usage:**
```bash
# Start services
./vendor/bin/sail up

# Run artisan commands
./vendor/bin/sail artisan migrate
```

**Includes:**
- PHP
- MySQL/PostgreSQL
- Redis
- Mailhog
- Selenium (for testing)

**Great for:** Consistent development environment across team.

---

#### **PHPUnit 11.x**
```json
"phpunit/phpunit": "^11.5.3"
```
**Purpose:** PHP testing framework  
**Usage:**
```bash
php artisan test
```

**Test Types:**
- **Unit Tests** - Test individual classes/methods
- **Feature Tests** - Test entire features (API endpoints)

**Example:**
```php
public function test_user_can_register()
{
    $response = $this->postJson('/api/register', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('users', [
        'email' => 'john@example.com',
    ]);
}
```

---

#### **Faker 1.x**
```json
"fakerphp/faker": "^1.23"
```
**Purpose:** Generate fake data  
**Usage:**
```php
use Faker\Factory;

$faker = Factory::create();

echo $faker->name;        // "John Doe"
echo $faker->email;       // "john@example.com"
echo $faker->text(200);   // Random text
```

**Used For:**
- Database seeding
- Testing
- Demo data

---

#### **Mockery 1.x**
```json
"mockery/mockery": "^1.6"
```
**Purpose:** Mocking framework untuk testing  
**Usage:**
```php
$mock = Mockery::mock(BookService::class);
$mock->shouldReceive('getAll')->andReturn([...]);
```

**Used For:**
- Unit testing
- Isolating dependencies
- Testing without real database/API calls

---

### Supporting Packages

#### **Guzzle HTTP**
```json
"guzzlehttp/guzzle": "^7.x"
```
**Purpose:** HTTP client  
**Used For:**
- Making HTTP requests to external APIs
- Testing HTTP responses

---

#### **Carbon (via Nesbot)**
```json
"nesbot/carbon": "^3.x"
```
**Purpose:** Date/time manipulation  
**Usage:**
```php
use Carbon\Carbon;

Carbon::now();                    // Current datetime
Carbon::parse('2024-01-01');      // Parse date
Carbon::now()->addDays(7);        // Add 7 days
Carbon::now()->diffForHumans();   // "5 minutes ago"
```

**Why Carbon?**
- Better than native DateTime
- Human-readable methods
- Timezone support
- i18n support

---

## 🗄 Database Architecture

### ER Diagram Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    Users    │────────→│ UserProfiles │         │ Categories  │
└─────────────┘         └──────────────┘         └─────────────┘
      │                                                  │
      │                                                  ↓
      │                                            ┌──────────┐
      ├───────────────────────────────────────────→│  Books   │
      │                                            └──────────┘
      │                                                  │
      │                                                  ↓
      │                                           ┌────────────┐
      ├──────────────────────────────────────────→│ BookCopies │
      │                                           └────────────┘
      │                                                  │
      ↓                                                  │
┌──────────┐                                            │
│  Loans   │←───────────────────────────────────────────┘
└──────────┘
      │
      ├────→ ┌──────────────┐
      │      │ BookReturns  │
      │      └──────────────┘
      │
      ├────→ ┌──────────┐
      │      │  Fines   │
      │      └──────────┘
      │
      └────→ ┌─────────────┐
             │ LostBooks   │
             └─────────────┘
```

### Core Tables

#### **users**
User authentication dan base information.

```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->string('password');
    $table->enum('role', ['admin', 'officer', 'member']);
    $table->enum('status', ['active', 'inactive', 'suspended']);
    $table->timestamp('email_verified_at')->nullable();
    $table->rememberToken();
    $table->timestamps();
    $table->softDeletes();
});
```

**Relationships:**
- `hasOne` UserProfile
- `hasMany` Loans
- `hasMany` BookReturns
- `hasMany` Notifications
- `hasMany` ActivityLogs

---

#### **user_profiles**
Extended user information.

```php
Schema::create('user_profiles', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('avatar_url')->nullable();
    $table->string('phone_number')->nullable();
    $table->text('address')->nullable();
    $table->date('date_of_birth')->nullable();
    $table->enum('gender', ['male', 'female'])->nullable();
    $table->timestamps();
});
```

---

#### **books**
Book information (master data).

```php
Schema::create('books', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->string('slug')->unique();
    $table->string('author');
    $table->string('publisher')->nullable();
    $table->string('isbn')->unique()->nullable();
    $table->year('publication_year')->nullable();
    $table->integer('pages')->nullable();
    $table->text('description')->nullable();
    $table->string('cover_image')->nullable();
    $table->foreignId('category_id')->constrained()->cascadeOnDelete();
    $table->timestamps();
    $table->softDeletes();
});
```

**Relationships:**
- `belongsTo` Category
- `hasMany` BookCopies

---

#### **book_copies**
Physical copies of books (inventory).

```php
Schema::create('book_copies', function (Blueprint $table) {
    $table->id();
    $table->foreignId('book_id')->constrained()->cascadeOnDelete();
    $table->string('barcode')->unique();
    $table->enum('condition', ['new', 'good', 'fair', 'poor']);
    $table->enum('status', ['available', 'borrowed', 'lost', 'damaged']);
    $table->text('notes')->nullable();
    $table->timestamps();
    $table->softDeletes();
});
```

**Why separate from books?**
- Satu buku bisa punya multiple copies
- Track status individual copy
- Better inventory management

---

#### **categories**
Book categories.

```php
Schema::create('categories', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('slug')->unique();
    $table->text('description')->nullable();
    $table->string('icon')->nullable();
    $table->timestamps();
    $table->softDeletes();
});
```

---

#### **loans**
Loan transactions.

```php
Schema::create('loans', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('book_copy_id')->constrained()->cascadeOnDelete();
    $table->foreignId('approved_by')->nullable()->constrained('users');
    $table->date('loan_date');
    $table->date('due_date');
    $table->date('return_date')->nullable();
    $table->enum('status', [
        'pending',           // Menunggu approval
        'approved',          // Disetujui, bisa diambil
        'rejected',          // Ditolak
        'checked_out',       // Sudah diambil
        'returned',          // Sudah dikembalikan
        'overdue',           // Terlambat
    ])->default('pending');
    $table->text('notes')->nullable();
    $table->timestamps();
    $table->softDeletes();
});
```

**Loan Flow:**
1. Member request loan → `pending`
2. Officer approve → `approved`
3. Member pick up book → `checked_out`
4. Member return book → `returned`

---

#### **book_returns**
Return transactions.

```php
Schema::create('book_returns', function (Blueprint $table) {
    $table->id();
    $table->foreignId('loan_id')->constrained()->cascadeOnDelete();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('approved_by')->nullable()->constrained('users');
    $table->date('return_date');
    $table->enum('book_condition', ['good', 'damaged', 'lost']);
    $table->text('notes')->nullable();
    $table->timestamps();
});
```

---

#### **fines**
Fine transactions.

```php
Schema::create('fines', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('loan_id')->nullable()->constrained()->nullOnDelete();
    $table->foreignId('fine_type_id')->constrained()->cascadeOnDelete();
    $table->decimal('amount', 10, 2);
    $table->enum('status', ['unpaid', 'paid', 'waived']);
    $table->date('due_date')->nullable();
    $table->date('paid_date')->nullable();
    $table->text('reason')->nullable();
    $table->timestamps();
});
```

**Fine Types:**
- Late return fine
- Lost book fine
- Damaged book fine

---

#### **notifications**
User notifications.

```php
Schema::create('notifications', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('title');
    $table->text('message');
    $table->string('type'); // loan_approved, return_reminder, etc
    $table->json('data')->nullable(); // Additional data
    $table->timestamp('read_at')->nullable();
    $table->timestamps();
});
```

---

#### **activity_logs**
Audit trail / activity logging.

```php
Schema::create('activity_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('action'); // login, create_book, approve_loan, etc
    $table->string('model_type')->nullable(); // Book, Loan, etc
    $table->unsignedBigInteger('model_id')->nullable();
    $table->json('data')->nullable();
    $table->string('ip_address')->nullable();
    $table->string('user_agent')->nullable();
    $table->timestamps();
});
```

**Logged Actions:**
- User login/logout
- CRUD operations
- Approvals
- Important changes

---

### Database Relationships

#### **One-to-One**
```php
// User has one Profile
class User extends Model {
    public function profile() {
        return $this->hasOne(UserProfile::class);
    }
}

// Profile belongs to User
class UserProfile extends Model {
    public function user() {
        return $this->belongsTo(User::class);
    }
}
```

#### **One-to-Many**
```php
// Book has many Copies
class Book extends Model {
    public function copies() {
        return $this->hasMany(BookCopy::class);
    }
}

// Copy belongs to Book
class BookCopy extends Model {
    public function book() {
        return $this->belongsTo(Book::class);
    }
}
```

#### **Many-to-Many**
```php
// Save (Wishlist) has many Books through SaveItems
class Save extends Model {
    public function books() {
        return $this->belongsToMany(Book::class, 'save_items')
            ->withTimestamps();
    }
}
```

---

## 🔌 API Architecture

### RESTful API Design

Bookera menggunakan **RESTful API** design principles.

#### API Versioning

```
/api/v1/books
```

Currently: Version 1 (implicit, no v1 prefix yet).

#### HTTP Methods

| Method | Purpose | Example |
|--------|---------|---------|
| `GET` | Retrieve data | GET `/api/books` |
| `POST` | Create new resource | POST `/api/books` |
| `PUT/PATCH` | Update resource | PUT `/api/books/1` |
| `DELETE` | Delete resource | DELETE `/api/books/1` |

#### Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE (no response body) |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Not authorized |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation failed |
| 500 | Server Error | Internal error |

### API Response Format

Standardized response menggunakan `ApiResponse` helper:

```php
// Success response
return ApiResponse::success($data, 'Message', 200);

// Error response
return ApiResponse::error('Error message', 400);

// Paginated response
return ApiResponse::paginated($items, 'Message');
```

**Success Response:**
```json
{
  "success": true,
  "message": "Books retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Laravel Guide",
      "author": "John Doe"
    }
  ]
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

**Paginated Response:**
```json
{
  "success": true,
  "message": "Books retrieved successfully",
  "data": [...],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 100,
    "last_page": 7
  }
}
```

### API Routes Structure

```php
// routes/api.php

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    
    // User routes
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Books (all users can view)
    Route::get('/books', [BookController::class, 'index']);
    Route::get('/books/{id}', [BookController::class, 'show']);
    
    // Admin only routes
    Route::middleware('role:admin')->group(function () {
        Route::post('/books', [BookController::class, 'store']);
        Route::put('/books/{id}', [BookController::class, 'update']);
        Route::delete('/books/{id}', [BookController::class, 'destroy']);
        
        Route::apiResource('users', UserController::class);
        Route::apiResource('categories', CategoryController::class);
    });
    
    // Officer & Admin routes
    Route::middleware('role:admin,officer')->group(function () {
        Route::post('/loans/{id}/approve', [ApprovalController::class, 'approveLoan']);
        Route::post('/loans/{id}/reject', [ApprovalController::class, 'rejectLoan']);
    });
    
    // Member routes
    Route::middleware('role:member')->group(function () {
        Route::post('/loans', [LoanController::class, 'store']);
        Route::get('/my-loans', [LoanController::class, 'myLoans']);
    });
});
```

### Controller Pattern

```php
// app/Http/Controllers/Api/BookController.php

class BookController extends Controller
{
    // GET /api/books
    public function index(Request $request)
    {
        $books = Book::with('category')
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('author', 'like', "%{$search}%");
            })
            ->paginate($request->per_page ?? 15);
        
        return ApiResponse::paginated($books, 'Books retrieved successfully');
    }
    
    // GET /api/books/{id}
    public function show($id)
    {
        $book = Book::with('category', 'copies')->findOrFail($id);
        return ApiResponse::success($book, 'Book retrieved successfully');
    }
    
    // POST /api/books
    public function store(BookRequest $request)
    {
        $book = Book::create($request->validated());
        
        // Handle cover image upload
        if ($request->hasFile('cover')) {
            $path = $request->file('cover')->store('book-covers', 'public');
            $book->update(['cover_image' => $path]);
        }
        
        return ApiResponse::success($book, 'Book created successfully', 201);
    }
    
    // PUT /api/books/{id}
    public function update(BookRequest $request, $id)
    {
        $book = Book::findOrFail($id);
        $book->update($request->validated());
        
        return ApiResponse::success($book, 'Book updated successfully');
    }
    
    // DELETE /api/books/{id}
    public function destroy($id)
    {
        $book = Book::findOrFail($id);
        $book->delete();
        
        return ApiResponse::success(null, 'Book deleted successfully');
    }
}
```

### Request Validation

```php
// app/Http/Requests/BookRequest.php

class BookRequest extends FormRequest
{
    public function authorize()
    {
        return true; // or check user permission
    }
    
    public function rules()
    {
        return [
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'isbn' => 'nullable|string|unique:books,isbn,' . $this->route('id'),
            'category_id' => 'required|exists:categories,id',
            'cover' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ];
    }
    
    public function messages()
    {
        return [
            'title.required' => 'Judul buku wajib diisi',
            'author.required' => 'Penulis wajib diisi',
            'cover.image' => 'File harus berupa gambar',
        ];
    }
}
```

---

## 🔐 Authentication & Authorization

### Laravel Sanctum

#### Token Generation

```php
// Login
public function login(LoginRequest $request)
{
    if (!Auth::attempt($request->only('email', 'password'))) {
        return ApiResponse::error('Invalid credentials', 401);
    }
    
    $user = Auth::user();
    $token = $user->createToken('auth-token')->plainTextToken;
    
    return ApiResponse::success([
        'user' => $user,
        'token' => $token,
    ], 'Login successful');
}
```

#### Token Usage

**Frontend stores token:**
```javascript
// Store in localStorage or cookie
localStorage.setItem('token', token)
```

**Include in API requests:**
```javascript
axios.get('/api/user', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
```

#### Token Verification

Laravel automatically verifies token via `auth:sanctum` middleware:

```php
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
```

### Role-Based Access Control (RBAC)

#### Roles
- **Admin** - Full access
- **Officer** - Manage loans, approvals
- **Member** - Borrow books, view history

#### Middleware

```php
// app/Http/Middleware/EnsureUserHasRole.php

public function handle($request, Closure $next, ...$roles)
{
    if (!$request->user() || !in_array($request->user()->role, $roles)) {
        return ApiResponse::error('Forbidden', 403);
    }
    
    return $next($request);
}
```

#### Usage

```php
// Protect routes
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::apiResource('users', UserController::class);
});

// Multiple roles
Route::middleware(['auth:sanctum', 'role:admin,officer'])->group(function () {
    Route::post('/loans/{id}/approve', [ApprovalController::class, 'approve']);
});
```

#### Gate/Policy (Alternative)

```php
// app/Policies/BookPolicy.php

class BookPolicy
{
    public function update(User $user, Book $book)
    {
        return $user->role === 'admin';
    }
    
    public function delete(User $user, Book $book)
    {
        return $user->role === 'admin';
    }
}

// In controller
$this->authorize('update', $book);
```

---

## 🔔 Real-time Broadcasting

### Laravel Events & Listeners

#### Event

```php
// app/Events/LoanApproved.php

class LoanApproved implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
    
    public $loan;
    
    public function __construct($loan)
    {
        $this->loan = $loan;
    }
    
    public function broadcastOn()
    {
        return new Channel('user.' . $this->loan->user_id);
    }
    
    public function broadcastAs()
    {
        return 'loan.approved';
    }
    
    public function broadcastWith()
    {
        return [
            'loan_id' => $this->loan->id,
            'book_title' => $this->loan->bookCopy->book->title,
            'message' => 'Your loan request has been approved!',
        ];
    }
}
```

#### Dispatch Event

```php
// In controller
use App\Events\LoanApproved;

public function approveLoan($id)
{
    $loan = Loan::findOrFail($id);
    $loan->update(['status' => 'approved']);
    
    // Broadcast event
    event(new LoanApproved($loan));
    
    return ApiResponse::success($loan, 'Loan approved');
}
```

#### Listen in Frontend

```javascript
// Frontend (Next.js)
import Echo from 'laravel-echo'

const echo = new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
    wsHost: process.env.NEXT_PUBLIC_WEBSOCKET_HOST,
    wsPort: process.env.NEXT_PUBLIC_WEBSOCKET_PORT,
})

// Listen to private channel
echo.channel(`user.${userId}`)
    .listen('.loan.approved', (data) => {
        console.log('Loan approved:', data)
        toast.success(data.message)
    })
```

### Broadcasting Channels

```php
// routes/channels.php

// Private channel - only for specific user
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Presence channel - see who's online
Broadcast::channel('chat', function ($user) {
    return ['id' => $user->id, 'name' => $user->name];
});
```

---

## ✨ Best Practices

### 1. **Model Relationships**

**Always define relationships:**
```php
// Good
class Book extends Model {
    public function category() {
        return $this->belongsTo(Category::class);
    }
    
    public function copies() {
        return $this->hasMany(BookCopy::class);
    }
}

// Usage
$book->category->name;
$book->copies->count();
```

### 2. **Eager Loading**

**Avoid N+1 query problem:**
```php
// Bad (N+1 queries)
$books = Book::all();
foreach ($books as $book) {
    echo $book->category->name; // Query for each book!
}

// Good (2 queries)
$books = Book::with('category')->get();
foreach ($books as $book) {
    echo $book->category->name;
}
```

### 3. **Request Validation**

**Use Form Requests:**
```php
// Bad
public function store(Request $request) {
    $request->validate([...]);
}

// Good
public function store(BookRequest $request) {
    // Already validated!
    $data = $request->validated();
}
```

### 4. **API Resources**

For complex response formatting:
```php
// app/Http/Resources/BookResource.php

class BookResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'author' => $this->author,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'available_copies' => $this->copies()->where('status', 'available')->count(),
        ];
    }
}

// Usage
return BookResource::collection($books);
```

### 5. **Service Classes**

For complex business logic:
```php
// app/Services/LoanService.php

class LoanService
{
    public function createLoan($userId, $bookCopyId)
    {
        // Validate availability
        // Create loan
        // Update book copy status
        // Send notification
        // Log activity
        
        return $loan;
    }
}
```

### 6. **Database Transactions**

For operations that must all succeed or fail:
```php
use Illuminate\Support\Facades\DB;

DB::transaction(function () {
    $loan = Loan::create([...]);
    $bookCopy->update(['status' => 'borrowed']);
    Notification::create([...]);
});
```

### 7. **Soft Deletes**

Don't hard-delete important data:
```php
use Illuminate\Database\Eloquent\SoftDeletes;

class Book extends Model
{
    use SoftDeletes;
}

// Now delete() only sets deleted_at timestamp
$book->delete();

// Query including soft deleted
Book::withTrashed()->get();

// Permanently delete
$book->forceDelete();
```

---

## 📚 Additional Resources

### Documentation
- [Laravel 12 Docs](https://laravel.com/docs/12.x)
- [Eloquent ORM](https://laravel.com/docs/12.x/eloquent)
- [Laravel Sanctum](https://laravel.com/docs/12.x/sanctum)
- [Laravel Broadcasting](https://laravel.com/docs/12.x/broadcasting)

### Learning
- [Laracasts](https://laracasts.com) - Video tutorials
- [Laravel News](https://laravel-news.com) - News & tutorials
- [Laravel Daily](https://laraveldaily.com) - Tips & tricks

---

## 📝 Next Steps

Lanjutkan ke dokumentasi lainnya:

1. **[Configuration Guide](./CONFIGURATION.md)** - Setup & konfigurasi
2. **[Frontend Configuration](../bookera-web/CONFIGURATION.md)** - Setup frontend
3. **[Frontend Architecture](../bookera-web/ARCHITECTURE.md)** - Arsitektur frontend

---

<div align="center">

**Questions?** Open an issue on [GitHub](https://github.com/yourusername/bookera/issues)

Made with ❤️ by Nadhif A.W

</div>
