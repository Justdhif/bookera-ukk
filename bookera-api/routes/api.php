<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\LoanController;
use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\BookCopyController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\BookReturnController;
use App\Http\Controllers\Api\ApprovalController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ContentPageController;
use App\Http\Controllers\Api\TermsOfServiceController;
use App\Http\Controllers\Api\PrivacyPolicyController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\LostBookController;
use App\Http\Controllers\Api\FineController;
use App\Http\Controllers\Api\FineTypeController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

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

Route::get('/activity-logs', [ActivityController::class, 'index']);
Route::get('/activity-logs/{id}', [ActivityController::class, 'show']);

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::middleware('auth:sanctum')->group(function () {

    Route::middleware('role:admin')->prefix('admin')->group(function () {

        Route::prefix('dashboard')->group(function () {
            Route::get('/totals', [DashboardController::class, 'totals']);
            Route::get('/loan-monthly-chart', [DashboardController::class, 'loanMonthlyChart']);
            Route::get('/loan-status-chart', [DashboardController::class, 'loanStatusChart']);
            Route::get('/latest', [DashboardController::class, 'latest']);
        });

        Route::get('users', [UserController::class, 'index']);
        Route::post('users', [UserController::class, 'store']);
        Route::get('users/identification/{identificationNumber}', [UserController::class, 'showByIdentification']);
        Route::get('users/{user}', [UserController::class, 'show']);
        Route::put('users/{user}', [UserController::class, 'update']);
        Route::patch('users/{user}', [UserController::class, 'update']);
        Route::delete('users/{user}', [UserController::class, 'destroy']);

        Route::post('books', [BookController::class, 'store']);
        Route::put('books/{book}', [BookController::class, 'update']);
        Route::delete('books/{book}', [BookController::class, 'destroy']);

        Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);

        Route::post('books/{book}/copies', [BookCopyController::class, 'store']);
        Route::delete('book-copies/{bookCopy}', [BookCopyController::class, 'destroy']);

        Route::get('loans', [LoanController::class, 'index']);
        Route::post('loans', [LoanController::class, 'storeAdminLoan']); // Admin creates direct loan

        // Approval routes
        Route::prefix('approvals')->group(function () {
            Route::get('loans/pending', [ApprovalController::class, 'getPendingLoans']);
            Route::get('loans/approved', [ApprovalController::class, 'getApprovedLoans']);
            Route::post('loans/{loan}/approve', [ApprovalController::class, 'approveLoan']);
            Route::post('loans/{loan}/reject', [ApprovalController::class, 'rejectLoan']);
            Route::post('loans/{loan}/mark-borrowed', [ApprovalController::class, 'markAsBorrowed']);
        });

        // Book Return routes (admin only)
        Route::prefix('book-returns')->group(function () {
            Route::post('/{bookReturn}/approve', [BookReturnController::class, 'approveReturn']);
        });

        // Fine Type routes (admin only)
        Route::apiResource('fine-types', FineTypeController::class);

        // Fine routes (admin only)
        Route::prefix('fines')->group(function () {
            Route::get('/', [FineController::class, 'index']);
            Route::post('/loans/{loan}', [FineController::class, 'store']);
            Route::get('/{fine}', [FineController::class, 'show']);
            Route::put('/{fine}', [FineController::class, 'update']);
            Route::post('/{fine}/mark-paid', [FineController::class, 'markAsPaid']);
            Route::post('/{fine}/waive', [FineController::class, 'waive']);
            Route::delete('/{fine}', [FineController::class, 'destroy']);
        });

        // Lost Book routes (admin only)
        Route::prefix('lost-books')->group(function () {
            Route::get('/', [LostBookController::class, 'index']);
            Route::get('/{lostBook}', [LostBookController::class, 'show']);
            Route::put('/{lostBook}', [LostBookController::class, 'update']);
            Route::post('/{lostBook}/finish', [LostBookController::class, 'finish']);
            Route::delete('/{lostBook}', [LostBookController::class, 'destroy']);
        });

        // Content Pages routes (admin)
        Route::get('content-pages', [ContentPageController::class, 'adminIndex']);
        Route::put('content-pages/{slug}', [ContentPageController::class, 'update']);

        // Terms of Service routes (admin - write operations)
        Route::prefix('terms-of-services')->group(function () {
            Route::post('/', [TermsOfServiceController::class, 'store']);
            Route::put('/{termsOfService}', [TermsOfServiceController::class, 'update']);
            Route::delete('/{termsOfService}', [TermsOfServiceController::class, 'destroy']);
            Route::post('/{termsOfService}/activate', [TermsOfServiceController::class, 'activate']);
        });

        // Privacy Policy routes (admin - write operations)
        Route::prefix('privacy-policies')->group(function () {
            Route::post('/', [PrivacyPolicyController::class, 'store']);
            Route::put('/{privacyPolicy}', [PrivacyPolicyController::class, 'update']);
            Route::delete('/{privacyPolicy}', [PrivacyPolicyController::class, 'destroy']);
            Route::post('/{privacyPolicy}/activate', [PrivacyPolicyController::class, 'activate']);
        });
    });

    Route::post('loans', [LoanController::class, 'store']);
    Route::get('loans/{loan}', [LoanController::class, 'show']);
    Route::get('my-loans', [LoanController::class, 'getLoanByUser']);

    // Book Return routes
    Route::post('loans/{loan}/return', [BookReturnController::class, 'store']);
    Route::get('loans/{loan}/returns', [BookReturnController::class, 'index']);
    Route::get('book-returns/{bookReturn}', [BookReturnController::class, 'show']);

    // Lost Book routes (user can report lost book)
    Route::post('loans/{loan}/report-lost', [LostBookController::class, 'store']);

    // Fine routes (user can view their fines)
    Route::get('loans/{loan}/fines', [FineController::class, 'loanFines']);

    // Notification routes
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/delete-all-read', [NotificationController::class, 'deleteAllRead']);
        Route::get('/{notification}', [NotificationController::class, 'show']);
        Route::post('/{notification}/mark-read', [NotificationController::class, 'markAsRead']);
        Route::delete('/{notification}', [NotificationController::class, 'destroy']);
    });

});

Route::get('books', [BookController::class, 'index']);
Route::get('books/slug/{slug}', [BookController::class, 'showBySlug']);
Route::get('books/{id}', [BookController::class, 'show']);

Route::apiResource('categories', CategoryController::class)->only('index');

// Content Pages routes (public)
Route::get('content-pages', [ContentPageController::class, 'index']);
Route::get('content-pages/{slug}', [ContentPageController::class, 'show']);

// Terms of Service routes (public - read operations)
Route::get('terms-of-services/active', [TermsOfServiceController::class, 'getActive']);
Route::get('terms-of-services', [TermsOfServiceController::class, 'index']);
Route::get('terms-of-services/{termsOfService}', [TermsOfServiceController::class, 'show']);

// Privacy Policy routes (public - read operations)
Route::get('privacy-policies/active', [PrivacyPolicyController::class, 'getActive']);
Route::get('privacy-policies', [PrivacyPolicyController::class, 'index']);
Route::get('privacy-policies/{privacyPolicy}', [PrivacyPolicyController::class, 'show']);
