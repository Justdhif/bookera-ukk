<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\LoanController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\BookCopyController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\BookReturnController;

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

        Route::apiResource('/students', StudentController::class);
        Route::apiResource('/teachers', TeacherController::class);
        Route::apiResource('/staffs', StaffController::class);

        Route::post('books', [BookController::class, 'store']);
        Route::put('books/{book}', [BookController::class, 'update']);
        Route::delete('books/{book}', [BookController::class, 'destroy']);

        Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);

        Route::post('books/{book}/copies', [BookCopyController::class, 'store']);
        Route::delete('book-copies/{bookCopy}', [BookCopyController::class, 'destroy']);

        Route::get('loans', [LoanController::class, 'index']);
    });

    Route::post('loans', [LoanController::class, 'store']);
    Route::get('loans/{loan}', [LoanController::class, 'show']);
    Route::get('my-loans', [LoanController::class, 'getLoanByUser']);

    Route::post('loans/{loan}/return', [BookReturnController::class, 'store']);
    Route::get('loans/{loan}/returns', [BookReturnController::class, 'index']);
    Route::get('book-returns/{bookReturn}', [BookReturnController::class, 'show']);

});

Route::get('books', [BookController::class, 'index']);
Route::get('books/{id}', [BookController::class, 'show']);

Route::apiResource('categories', CategoryController::class)->only('index');
