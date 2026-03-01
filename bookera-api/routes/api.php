<?php

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\BookCopyController;
use App\Http\Controllers\Api\BookReturnController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ContentPageController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FineController;
use App\Http\Controllers\Api\FineTypeController;
use App\Http\Controllers\Api\BorrowController;
use App\Http\Controllers\Api\BorrowRequestController;
use App\Http\Controllers\Api\LostBookController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PrivacyPolicyController;
use App\Http\Controllers\Api\SaveController;
use App\Http\Controllers\Api\TermsOfServiceController;
use App\Http\Controllers\Api\UserController;

Broadcast::routes(['middleware' => ['auth:sanctum']]);

Route::get('/', function () {
    return response()->json([
        'message' => 'Welcome to the Bookera API'
    ]);
});

Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working'
    ]);
});

Route::get('/test-smtp', function () {
    Mail::raw('SMTP berhasil terkoneksi', function ($message) {
        $message->to('noob1234five@gmail.com')
                ->subject('Test SMTP Laravel');
    });

    return 'Email berhasil dikirim';
});

Route::get('books', [BookController::class, 'index']);
Route::get('books/slug/{slug}', [BookController::class, 'showBySlug']);
Route::get('books/{id}', [BookController::class, 'show']);

Route::get('categories', [CategoryController::class, 'index']);

Route::get('content-pages', [ContentPageController::class, 'index']);
Route::get('content-pages/{slug}', [ContentPageController::class, 'show']);

Route::get('terms-of-services/active', [TermsOfServiceController::class, 'getActive']);
Route::get('terms-of-services', [TermsOfServiceController::class, 'index']);
Route::get('terms-of-services/{termsOfService}', [TermsOfServiceController::class, 'show']);

Route::get('privacy-policies/active', [PrivacyPolicyController::class, 'getActive']);
Route::get('privacy-policies', [PrivacyPolicyController::class, 'index']);
Route::get('privacy-policies/{privacyPolicy}', [PrivacyPolicyController::class, 'show']);

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/setup-profile', [AuthController::class, 'setupProfile']);

    });
});

Route::middleware('auth:sanctum')->group(function () {

    Route::put('users/{user}', [UserController::class, 'update']);
    Route::patch('users/{user}', [UserController::class, 'update']);

    Route::middleware('role:admin,officer:*')->prefix('admin')->group(function () {

        Route::prefix('dashboard')->group(function () {
            Route::get('/totals', [DashboardController::class, 'totals']);
            Route::get('/loan-monthly-chart', [DashboardController::class, 'loanMonthlyChart']);
            Route::get('/loan-status-chart', [DashboardController::class, 'loanStatusChart']);
            Route::get('/latest', [DashboardController::class, 'latest']);
        });
    });

    Route::middleware('role:admin,officer:catalog')->prefix('admin')->group(function () {

        Route::prefix('books')->group(function () {
            Route::post('/', [BookController::class, 'store']);
            Route::put('/{book}', [BookController::class, 'update']);
            Route::delete('/{book}', [BookController::class, 'destroy']);
            Route::post('/{book}/copies', [BookCopyController::class, 'store']);
        });

        Route::delete('book-copies/{bookCopy}', [BookCopyController::class, 'destroy']);

        Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
    });

    Route::middleware('role:admin,officer:management')->prefix('admin')->group(function () {

        Route::prefix('users')->group(function () {
            Route::get('/', [UserController::class, 'index']);
            Route::post('/', [UserController::class, 'store']);
            Route::get('/identification/{identificationNumber}', [UserController::class, 'showByIdentification']);
            Route::get('/{user}', [UserController::class, 'show']);
            Route::delete('/{user}', [UserController::class, 'destroy']);
        });

        Route::prefix('borrows')->group(function () {
            Route::get('/', [BorrowController::class, 'index']);
            Route::post('/', [BorrowController::class, 'storeAdminBorrow']);
            Route::get('/code/{code}', [BorrowController::class, 'showByCode']);
        });

        Route::prefix('borrow-requests')->group(function () {
            Route::get('/', [BorrowRequestController::class, 'index']);
            Route::get('/code/{code}', [BorrowRequestController::class, 'showByCode']);
            Route::get('/{borrowRequest}', [BorrowRequestController::class, 'show']);
            Route::post('/{borrowRequest}/assign', [BorrowRequestController::class, 'assignBorrow']);
            Route::delete('/{borrowRequest}', [BorrowRequestController::class, 'destroy']);
        });

        Route::prefix('book-returns')->group(function () {
            Route::post('/{bookReturn}/approve', [BookReturnController::class, 'approveReturn']);
            Route::post('/{bookReturn}/process-fine', [BookReturnController::class, 'processFine']);
        });

        Route::apiResource('fine-types', FineTypeController::class);

        Route::prefix('fines')->group(function () {
            Route::get('/', [FineController::class, 'index']);
            Route::post('/borrows/{borrow}', [FineController::class, 'store']);
            Route::get('/{fine}', [FineController::class, 'show']);
            Route::put('/{fine}', [FineController::class, 'update']);
            Route::post('/{fine}/mark-paid', [FineController::class, 'markAsPaid']);
            Route::post('/{fine}/waive', [FineController::class, 'waive']);
            Route::delete('/{fine}', [FineController::class, 'destroy']);
        });

        Route::prefix('lost-books')->group(function () {
            Route::get('/', [LostBookController::class, 'index']);
            Route::get('/{lostBook}', [LostBookController::class, 'show']);
            Route::put('/{lostBook}', [LostBookController::class, 'update']);
            Route::post('/{lostBook}/finish', [LostBookController::class, 'finish']);
            Route::post('/{lostBook}/process-fine', [LostBookController::class, 'processFine']);
            Route::delete('/{lostBook}', [LostBookController::class, 'destroy']);
        });

        Route::prefix('activity-logs')->group(function () {
            Route::get('/', [ActivityController::class, 'index']);
            Route::get('/{id}', [ActivityController::class, 'show']);
        });
    });

    Route::middleware('role:admin')->prefix('admin')->group(function () {

        Route::prefix('content-pages')->group(function () {
            Route::get('/', [ContentPageController::class, 'adminIndex']);
            Route::put('/{slug}', [ContentPageController::class, 'update']);
        });

        Route::prefix('terms-of-services')->group(function () {
            Route::post('/', [TermsOfServiceController::class, 'store']);
            Route::put('/{termsOfService}', [TermsOfServiceController::class, 'update']);
            Route::delete('/{termsOfService}', [TermsOfServiceController::class, 'destroy']);
            Route::post('/{termsOfService}/activate', [TermsOfServiceController::class, 'activate']);
        });

        Route::prefix('privacy-policies')->group(function () {
            Route::post('/', [PrivacyPolicyController::class, 'store']);
            Route::put('/{privacyPolicy}', [PrivacyPolicyController::class, 'update']);
            Route::delete('/{privacyPolicy}', [PrivacyPolicyController::class, 'destroy']);
            Route::post('/{privacyPolicy}/activate', [PrivacyPolicyController::class, 'activate']);
        });
    });

    Route::prefix('borrows')->group(function () {
        Route::post('/', [BorrowController::class, 'store']);
        Route::get('/code/{code}', [BorrowController::class, 'showByCode']);
        Route::get('/{borrow}', [BorrowController::class, 'show']);
        Route::post('/{borrow}/return', [BookReturnController::class, 'store']);
        Route::get('/{borrow}/returns', [BookReturnController::class, 'index']);
        Route::post('/{borrow}/report-lost', [LostBookController::class, 'store']);
        Route::get('/{borrow}/fines', [FineController::class, 'borrowFines']);
    });

    Route::get('my-borrows', [BorrowController::class, 'getBorrowByUser']);

    Route::prefix('borrow-requests')->group(function () {
        Route::post('/', [BorrowRequestController::class, 'store']);
        Route::get('/{borrowRequest}', [BorrowRequestController::class, 'show']);
        Route::delete('/{borrowRequest}', [BorrowRequestController::class, 'destroy']);
    });

    Route::get('my-borrow-requests', [BorrowRequestController::class, 'getMyRequests']);

    Route::get('my-fines', [FineController::class, 'myFines']);



    Route::get('book-returns/{bookReturn}', [BookReturnController::class, 'show']);

    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/delete-all-read', [NotificationController::class, 'deleteAllRead']);
        Route::get('/{notification}', [NotificationController::class, 'show']);
        Route::post('/{notification}/mark-read', [NotificationController::class, 'markAsRead']);
        Route::delete('/{notification}', [NotificationController::class, 'destroy']);
    });

    Route::prefix('saves')->group(function () {
        Route::get('/', [SaveController::class, 'index']);
        Route::post('/', [SaveController::class, 'store']);
        Route::get('/{save}', [SaveController::class, 'show']);
        Route::put('/{save}', [SaveController::class, 'update']);
        Route::delete('/{save}', [SaveController::class, 'destroy']);
        Route::post('/{save}/books', [SaveController::class, 'addBook']);
        Route::delete('/{save}/books/{book}', [SaveController::class, 'removeBook']);
    });
});
