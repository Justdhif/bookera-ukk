<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Review\StoreReviewRequest;
use App\Services\Review\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    private ReviewService $reviewService;

    public function __construct(ReviewService $reviewService)
    {
        $this->reviewService = $reviewService;
    }

    public function index(Request $request, int $bookId): JsonResponse
    {
        $filters = [
            'per_page' => $request->per_page,
        ];

        $reviews = $this->reviewService->getByBookId($bookId, $filters);

        return ApiResponse::successResponse('Data ulasan berhasil diambil', $reviews);
    }

    public function store(StoreReviewRequest $request): JsonResponse
    {
        try {
            $review = $this->reviewService->createOrUpdate($request->validated());
            return ApiResponse::successResponse('Ulasan berhasil disimpan', $review, 201);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 400);
        }
    }

    public function destroy(int $bookId): JsonResponse
    {
        try {
            $this->reviewService->delete($bookId);
            return ApiResponse::successResponse('Ulasan berhasil dihapus', null);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 404);
        }
    }

    public function check(int $bookId): JsonResponse
    {
        $review = $this->reviewService->check($bookId);

        return ApiResponse::successResponse('Status ulasan', ['review' => $review]);
    }
}
