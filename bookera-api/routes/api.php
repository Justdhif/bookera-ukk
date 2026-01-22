<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\LoanController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\BookCopyController;
use App\Http\Controllers\Api\CategoryController;
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

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::middleware('auth:sanctum')->group(function () {

    Route::middleware('role:admin')->prefix('admin')->group(function () {
        
        Route::apiResource('/students', StudentController::class);
        Route::apiResource('/teachers', TeacherController::class);
        Route::apiResource('/staffs', StaffController::class);

        Route::apiResource('books', BookController::class)->except(['index', 'show']);

        Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);

        Route::post('books/{book}/copies', [BookCopyController::class, 'store']);
        Route::delete('book-copies/{bookCopy}', [BookCopyController::class, 'destroy']);
    });

    Route::apiResource('books', BookController::class)->only(['index', 'show']);

    Route::apiResource('categories', CategoryController::class)->only('index');

    Route::get('loans', [LoanController::class, 'index']);
    Route::post('loans', [LoanController::class, 'store']);

    Route::post('loans/{loan}/return', [BookReturnController::class, 'store']);

});
