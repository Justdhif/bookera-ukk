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
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FineController;
use App\Http\Controllers\Api\FineTypeController;
use App\Http\Controllers\Api\BorrowController;
use App\Http\Controllers\Api\BorrowRequestController;
use App\Http\Controllers\Api\LostBookController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PrivacyPolicyController;
use App\Http\Controllers\Api\AuthorController;
use App\Http\Controllers\Api\PublisherController;
use App\Http\Controllers\Api\DiscussionPostController;
use App\Http\Controllers\Api\DiscussionLikeController;
use App\Http\Controllers\Api\DiscussionCommentController;
use App\Http\Controllers\Api\FollowController;
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

Route::get('authors', [AuthorController::class, 'list']);
Route::get('authors/{author}', [AuthorController::class, 'show']);

Route::get('publishers', [PublisherController::class, 'list']);
Route::get('publishers/{publisher}', [PublisherController::class, 'show']);

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
            Route::get('/identification/{identificationNumber}', [UserController::class, 'showByIdentification']);
            Route::get('/{user}', [UserController::class, 'show']);
            Route::delete('/{user}', [UserController::class, 'destroy']);
        });

        Route::prefix('borrows')->group(function () {
            Route::get('/', [BorrowController::class, 'index']);
            Route::post('/', [BorrowController::class, 'storeAdminBorrow']);
            Route::get('/code/{code}', [BorrowController::class, 'showByCode']);
            Route::post('/{borrow}/assign-copies', [BorrowController::class, 'assignCopies']);
        });

        Route::prefix('borrow-requests')->group(function () {
            Route::get('/', [BorrowRequestController::class, 'index']);
            Route::get('/{borrowRequest}', [BorrowRequestController::class, 'show']);
            Route::post('/{borrowRequest}/assign', [BorrowRequestController::class, 'assignBorrow']);
            Route::patch('/{borrowRequest}/approve', [BorrowRequestController::class, 'approve']);
            Route::patch('/{borrowRequest}/reject', [BorrowRequestController::class, 'reject']);
            Route::delete('/{borrowRequest}', [BorrowRequestController::class, 'destroy']);
        });

        Route::prefix('book-returns')->group(function () {
            Route::post('/{bookReturn}/approve', [BookReturnController::class, 'approveReturn']);
            Route::post('/{bookReturn}/process-fine', [BookReturnController::class, 'processFine']);
            Route::patch('/{bookReturn}/conditions', [BookReturnController::class, 'updateConditions']);
            Route::post('/{bookReturn}/finish-fines', [BookReturnController::class, 'finishFines']);
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
        Route::patch('/{borrowRequest}/cancel', [BorrowRequestController::class, 'cancel']);
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

    Route::prefix('follows')->group(function () {
        Route::get('/authors', [FollowController::class, 'authors']);
        Route::get('/publishers', [FollowController::class, 'publishers']);
        Route::get('/users', [FollowController::class, 'users']);
        Route::get('/check', [FollowController::class, 'check']);
        Route::post('/', [FollowController::class, 'follow']);
        Route::delete('/', [FollowController::class, 'unfollow']);
        Route::get('/authors/{slug}', [FollowController::class, 'authorDetail']);
        Route::get('/publishers/{slug}', [FollowController::class, 'publisherDetail']);
    });

    Route::prefix('discussion-posts')->group(function () {
        Route::get('/', [DiscussionPostController::class, 'index']);
        Route::post('/', [DiscussionPostController::class, 'store']);
        Route::get('/feed/following', [DiscussionPostController::class, 'following']);
        Route::get('/active-users', [DiscussionPostController::class, 'activeUsers']);
        Route::get('/user/{userId}', [DiscussionPostController::class, 'byUser']);
        Route::get('/{slug}', [DiscussionPostController::class, 'show']);
        Route::put('/{slug}', [DiscussionPostController::class, 'update']);
        Route::delete('/{slug}', [DiscussionPostController::class, 'destroy']);
        Route::post('/{slug}/like', [DiscussionLikeController::class, 'toggle']);
        Route::get('/{slug}/comments', [DiscussionCommentController::class, 'index']);
        Route::post('/{slug}/comments', [DiscussionCommentController::class, 'store']);
    });

    Route::prefix('discussion-comments')->group(function () {
        Route::put('/{comment}', [DiscussionCommentController::class, 'update']);
        Route::delete('/{comment}', [DiscussionCommentController::class, 'destroy']);
        Route::get('/{comment}/replies', [DiscussionCommentController::class, 'replies']);
    });

    Route::prefix('users')->group(function () {
        Route::get('/{userId}/followers', [FollowController::class, 'userFollowers']);
        Route::get('/{userId}/following', [FollowController::class, 'userFollowing']);
        Route::get('/{userId}/follow-counts', [FollowController::class, 'userFollowCounts']);
        Route::get('/{userId}/profile', [FollowController::class, 'userPublicProfile']);
    });
});
