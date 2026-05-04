<?php

use App\Http\Controllers\Api\AIChatController;
use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AuthorController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\BookCopyController;
use App\Http\Controllers\Api\BookReturnController;
use App\Http\Controllers\Api\BorrowController;
use App\Http\Controllers\Api\BorrowRequestController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\GenreController;
use App\Http\Controllers\Api\DashboardController;

use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\FineController;
use App\Http\Controllers\Api\FineTypeController;
use App\Http\Controllers\Api\FollowController;
use App\Http\Controllers\Api\LostBookController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\PrivacyPolicyController;
use App\Http\Controllers\Api\PublisherController;
use App\Http\Controllers\Api\TermsOfServiceController;
use App\Http\Controllers\Api\PhoneController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\ComplaintCommentController;
use App\Http\Controllers\Api\ComplaintVoteController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\NotificationSettingsController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\MembershipController;
use App\Http\Controllers\Api\Admin\MembershipPlanController;

use App\Http\Controllers\Api\Admin\NewsController as AdminNewsController;
use App\Http\Controllers\Api\NewsController;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;

Broadcast::routes(['middleware' => ['auth:sanctum']]);

Route::get('/', function () {
    return response()->json([
        'message' => 'Welcome to the Bookera API',
    ]);
});

Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working',
    ]);
});

Route::get('/test-smtp', function () {
    Mail::raw('SMTP berhasil terkoneksi', function ($message) {
        $message->to('noob1234five@gmail.com')
            ->subject('Test SMTP Laravel');
    });

    return 'Email berhasil dikirim';
});

Route::get('books', [PublicController::class, 'books']);
Route::get('books/slug/{slug}', [PublicController::class, 'bookBySlug']);
Route::get('books/{id}', [PublicController::class, 'bookById'])->whereNumber('id');

Route::get('users', [PublicController::class, 'users']);

Route::get('books/{id}/reviews', [ReviewController::class, 'index']);
Route::get('complaints', [ComplaintController::class, 'index']);
Route::get('complaints/{slug}', [ComplaintController::class, 'show']);
Route::get('complaints/{slug}/comments', [ComplaintCommentController::class, 'index']);

Route::get('categories', [PublicController::class, 'categories']);
Route::get('stats', [PublicController::class, 'publicStats']);

Route::get('news', [NewsController::class, 'index']);
Route::get('news/{slug}', [NewsController::class, 'show']);
Route::get('news/{news}/comments', [NewsController::class, 'getComments']);

// Membership Plans (public)
Route::get('membership/plans', [MembershipController::class, 'plans']);
// Midtrans webhook (no auth — Midtrans calls this)
Route::post('membership/notification', [MembershipController::class, 'handleNotification']);

Route::get('authors', [PublicController::class, 'authors']);
Route::get('authors/slug/{slug}', [PublicController::class, 'authorBySlug']);


Route::get('publishers', [PublicController::class, 'publishers']);
Route::get('publishers/slug/{slug}', [PublicController::class, 'publisherBySlug']);


Route::get('terms-of-services/active', [TermsOfServiceController::class, 'getActive']);
Route::get('terms-of-services', [TermsOfServiceController::class, 'index']);
Route::get('terms-of-services/{termsOfService}', [TermsOfServiceController::class, 'show']);

Route::get('privacy-policies/active', [PrivacyPolicyController::class, 'getActive']);
Route::get('privacy-policies', [PrivacyPolicyController::class, 'index']);
Route::get('privacy-policies/{privacyPolicy}', [PrivacyPolicyController::class, 'show']);

Route::get('users/{userSlug}/followers', [FollowController::class, 'userFollowers']);
Route::get('users/{userSlug}/following', [FollowController::class, 'userFollowing']);
Route::get('users/{userSlug}/follow-counts', [FollowController::class, 'userFollowCounts']);
Route::get('users/{userSlug}/profile', [FollowController::class, 'userPublicProfile']);



// AI Chatbot
Route::prefix('ai')->group(function () {
    Route::post('/chat', [AIChatController::class, 'chat']);
    Route::get('/history', [AIChatController::class, 'getHistory']);
    Route::delete('/history', [AIChatController::class, 'clearHistory']);
});

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::post('/activate', [AuthController::class, 'activate']);
    Route::post('/resend-activation', [AuthController::class, 'resendActivation']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/setup-profile', [AuthController::class, 'setupProfile']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);

    });
});

Route::middleware('auth:sanctum')->group(function () {

    Route::put('users/{user}', [UserController::class, 'update']);
    Route::patch('users/{user}', [UserController::class, 'update']);

    Route::prefix('phone')->group(function () {
        Route::post('/request-change', [PhoneController::class, 'requestChange']);
        Route::post('/verify-otp', [PhoneController::class, 'verifyOtp']);
    });

    Route::prefix('email')->group(function () {
        Route::post('/request-change', [\App\Http\Controllers\Api\EmailController::class, 'requestChange']);
        Route::post('/verify-otp', [\App\Http\Controllers\Api\EmailController::class, 'verifyOtp']);
    });

    Route::middleware('role:admin,officer:*')->prefix('admin')->group(function () {

        Route::prefix('dashboard')->group(function () {
            Route::get('/totals', [DashboardController::class, 'totals']);
            Route::get('/top-borrowed-categories', [DashboardController::class, 'topBorrowedCategories']);
            Route::get('/top-borrowed-books', [DashboardController::class, 'topBorrowedBooks']);
            Route::get('/loan-monthly-chart', [DashboardController::class, 'loanMonthlyChart']);
            Route::get('/loan-status-chart', [DashboardController::class, 'loanStatusChart']);
            Route::get('/calendar', [DashboardController::class, 'calendar']);
            Route::get('/day-detail', [DashboardController::class, 'dayDetail']);
            Route::get('/borrow-comparison-chart', [DashboardController::class, 'borrowComparisonChart']);
            Route::get('/login-register-trend-chart', [DashboardController::class, 'loginRegisterTrendChart']);
        });
    });

    Route::middleware('role:admin,officer:catalog')->prefix('admin')->group(function () {

        Route::prefix('categories')->group(function () {
            Route::get('/', [CategoryController::class, 'index']);
        });

        Route::prefix('genres')->group(function () {
            Route::get('/', [GenreController::class, 'index']);
        });

        Route::prefix('books')->group(function () {
            Route::get('/', [BookController::class, 'index']);
            Route::get('/export', [BookController::class, 'export']);
            Route::get('/slug/{slug}', [BookController::class, 'showBySlug']);
            Route::post('/import', [BookController::class, 'import']);

            Route::post('/', [BookController::class, 'store']);
            Route::get('/{id}', [BookController::class, 'show'])->whereNumber('id');
            Route::put('/{book}', [BookController::class, 'update']);
            Route::delete('/{book}', [BookController::class, 'destroy']);
            Route::post('/{book}/copies', [BookCopyController::class, 'store']);
        });

        Route::delete('book-copies/{bookCopy}', [BookCopyController::class, 'destroy']);

    Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
    Route::apiResource('genres', GenreController::class)->except(['index', 'show']);

        Route::prefix('authors')->group(function () {
            Route::get('/', [AuthorController::class, 'index']);

            Route::post('/', [AuthorController::class, 'store']);
            Route::put('/{author}', [AuthorController::class, 'update']);
            Route::patch('/{author}', [AuthorController::class, 'update']);
            Route::delete('/{author}', [AuthorController::class, 'destroy']);
        });

        Route::prefix('publishers')->group(function () {
            Route::get('/', [PublisherController::class, 'index']);

            Route::post('/', [PublisherController::class, 'store']);
            Route::put('/{publisher}', [PublisherController::class, 'update']);
            Route::patch('/{publisher}', [PublisherController::class, 'update']);
            Route::delete('/{publisher}', [PublisherController::class, 'destroy']);
        });
    });

    Route::middleware('role:admin,officer:management')->prefix('admin')->group(function () {

        Route::prefix('users')->group(function () {
            Route::get('/', [UserController::class, 'index']);
            Route::post('/', [UserController::class, 'store']);
            Route::get('/slug/{slug}', [UserController::class, 'showBySlug']);
            Route::get('/identification/{identificationNumber}', [UserController::class, 'showByIdentification']);

            Route::delete('/{user}', [UserController::class, 'destroy']);
        });

        Route::prefix('borrows')->group(function () {
            Route::get('/', [BorrowController::class, 'index']);
            Route::get('/export', [BorrowController::class, 'export']);
            Route::post('/', [BorrowController::class, 'storeAdminBorrow']);
            Route::get('/code/{code}', [BorrowController::class, 'showByCode']);
            Route::post('/{borrow}/assign-copies', [BorrowController::class, 'assignCopies']);
            Route::post('/{borrow}/complete', [BorrowController::class, 'complete']);
        });

        Route::prefix('borrow-requests')->group(function () {
            Route::get('/', [BorrowRequestController::class, 'index']);
            Route::get('/export', [BorrowRequestController::class, 'export']);
            Route::get('/{borrowRequest}', [BorrowRequestController::class, 'show']);
            Route::post('/{borrowRequest}/assign', [BorrowRequestController::class, 'assignBorrow']);
            Route::patch('/{borrowRequest}/approve', [BorrowRequestController::class, 'approve']);
            Route::patch('/{borrowRequest}/reject', [BorrowRequestController::class, 'reject']);

        });

        Route::apiResource('fine-types', FineTypeController::class)->only(['index', 'store', 'destroy']);

        Route::prefix('fines')->group(function () {
            Route::get('/', [FineController::class, 'index']);
            Route::get('/export', [FineController::class, 'export']);
            Route::post('/{fine}/mark-paid', [FineController::class, 'markAsPaid']);
        });

        Route::prefix('returns')->group(function () {
            Route::get('/', [BookReturnController::class, 'adminIndex']);
            Route::get('/export', [BookReturnController::class, 'export']);
        });

        Route::prefix('lost-books')->group(function () {
            Route::get('/', [LostBookController::class, 'index']);
            Route::get('/export', [LostBookController::class, 'export']);
        });

        Route::prefix('activity-logs')->group(function () {
            Route::get('/', [ActivityController::class, 'index']);
            Route::get('/{id}', [ActivityController::class, 'show']);
        });



        // Complaint management
        Route::prefix('complaints')->group(function () {
            Route::patch('/{slug}/status', [ComplaintController::class, 'updateStatus']);
        });

        // Membership Plans
        Route::get('membership-plans', [MembershipPlanController::class, 'index']);
        Route::put('membership-plans/{id}', [MembershipPlanController::class, 'update']);

        // Reservation management
        Route::prefix('reservations')->group(function () {
            Route::get('/', [ReservationController::class, 'index']);
        });

        Route::apiResource('news', AdminNewsController::class)->except(['index', 'show']);
    });

    Route::middleware('role:admin')->prefix('admin')->group(function () {

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

        Route::post('/{borrow}/return', [BookReturnController::class, 'store'])->middleware('role:admin,officer:management');
        Route::get('/{borrow}/returns', [BookReturnController::class, 'index'])->middleware('role:admin,officer:management');
        Route::post('/{borrow}/report-lost', [LostBookController::class, 'store']);
        Route::get('/{borrow}/fines', [FineController::class, 'borrowFines']);
    });

    Route::get('my-borrows', [BorrowController::class, 'getBorrowByUser']);



    // User Chat
    Route::prefix('chat')->group(function () {
        Route::get('/conversations', [\App\Http\Controllers\Api\ChatController::class, 'getConversations']);
        Route::post('/moderate', [\App\Http\Controllers\Api\ChatController::class, 'moderateMessage']);
        Route::get('/{userSlug}', [\App\Http\Controllers\Api\ChatController::class, 'getMessages']);
        Route::post('/{userSlug}', [\App\Http\Controllers\Api\ChatController::class, 'sendMessage']);
        Route::patch('/{userSlug}/read', [\App\Http\Controllers\Api\ChatController::class, 'markAsRead']);
        Route::delete('/{userSlug}', [\App\Http\Controllers\Api\ChatController::class, 'deleteConversation']);
        Route::delete('/{userSlug}/clear', [\App\Http\Controllers\Api\ChatController::class, 'clearMessages']);
    });


    Route::prefix('borrow-requests')->group(function () {
        Route::post('/', [BorrowRequestController::class, 'store']);
        Route::get('/{borrowRequest}', [BorrowRequestController::class, 'show']);
        Route::patch('/{borrowRequest}/cancel', [BorrowRequestController::class, 'cancel']);
    });

    Route::get('my-borrow-requests', [BorrowRequestController::class, 'getMyRequests']);

    Route::get('my-fines', [FineController::class, 'myFines']);
    Route::get('fine-types', [FineTypeController::class, 'index']);
    Route::get('book-returns/{bookReturn}', [BookReturnController::class, 'show'])->middleware('role:admin,officer:management');

    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/delete-all-read', [NotificationController::class, 'deleteAllRead']);
        Route::get('/{notification}', [NotificationController::class, 'show']);
        Route::post('/{notification}/mark-read', [NotificationController::class, 'markAsRead']);
        Route::delete('/{notification}', [NotificationController::class, 'destroy']);
    });

    Route::prefix('settings')->group(function () {
        Route::get('/notifications', [NotificationSettingsController::class, 'show']);
        Route::patch('/notifications', [NotificationSettingsController::class, 'update']);
    });

    Route::prefix('favorites')->group(function () {
        Route::get('/', [FavoriteController::class, 'index']);
        Route::post('/', [FavoriteController::class, 'store']);
        Route::delete('/{bookId}', [FavoriteController::class, 'destroy']);
        Route::get('/check/{bookId}', [FavoriteController::class, 'check']);
    });

    Route::prefix('reviews')->group(function () {
        Route::post('/', [ReviewController::class, 'store']);
        Route::delete('/{bookId}', [ReviewController::class, 'destroy']);
        Route::get('/check/{bookId}', [ReviewController::class, 'check']);
    });

    Route::prefix('follows')->group(function () {
        Route::get('/users', [FollowController::class, 'users']);
        Route::get('/check', [FollowController::class, 'check']);
        Route::post('/', [FollowController::class, 'follow']);
        Route::delete('/', [FollowController::class, 'unfollow']);
    });



    Route::prefix('complaints')->group(function () {
        Route::post('/', [ComplaintController::class, 'store']);
        Route::delete('/{slug}', [ComplaintController::class, 'destroy']);
        Route::post('/{slug}/vote', [ComplaintVoteController::class, 'toggle']);
        Route::post('/{slug}/comments', [ComplaintCommentController::class, 'store']);
    });

    Route::prefix('news')->group(function () {
        Route::post('/{news}/comments', [NewsController::class, 'storeComment']);
    });

    Route::prefix('news-comments')->group(function () {
        Route::delete('/{comment}', [NewsController::class, 'destroyComment']);
    });

    Route::prefix('complaint-comments')->group(function () {
        Route::delete('/{id}', [ComplaintCommentController::class, 'destroy']);
    });

    Route::prefix('reservations')->group(function () {
        Route::post('/', [ReservationController::class, 'store']);
        Route::get('/prediction/{bookId}', [ReservationController::class, 'prediction']);
        Route::delete('/{reservation}', [ReservationController::class, 'cancel']);
        Route::get('/check/{bookId}', [ReservationController::class, 'check']);
    });

    Route::get('my-reservations', [ReservationController::class, 'myReservations']);

    // Membership
    Route::prefix('membership')->group(function () {
        Route::post('/transaction', [MembershipController::class, 'createTransaction']);
        Route::get('/status', [MembershipController::class, 'checkStatus']);
    });

});
