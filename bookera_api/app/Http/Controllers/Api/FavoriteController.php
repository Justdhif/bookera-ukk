<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Favorite\StoreFavoriteRequest;
use App\Services\Favorite\FavoriteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    private FavoriteService $favoriteService;

    public function __construct(FavoriteService $favoriteService)
    {
        $this->favoriteService = $favoriteService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'search'      => $request->search,
            'category_id' => $request->category_id,
            'per_page'    => $request->per_page,
        ];

        $favorites = $this->favoriteService->getAll($filters);

        return ApiResponse::successResponse('Data favorit berhasil diambil', $favorites);
    }

    public function store(StoreFavoriteRequest $request): JsonResponse
    {
        try {
            $favorite = $this->favoriteService->create($request->validated());
            return ApiResponse::successResponse('Buku berhasil ditambahkan ke favorit', $favorite, 201);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 400);
        }
    }

    public function destroy(int $bookId): JsonResponse
    {
        try {
            $this->favoriteService->delete($bookId);
            return ApiResponse::successResponse('Buku berhasil dihapus dari favorit', null);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 404);
        }
    }

    public function check(int $bookId): JsonResponse
    {
        $isFavorite = $this->favoriteService->check($bookId);

        return ApiResponse::successResponse('Status favorit', ['is_favorite' => $isFavorite]);
    }
}
