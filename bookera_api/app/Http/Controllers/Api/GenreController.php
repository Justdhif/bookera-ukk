<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Genre\StoreGenreRequest;
use App\Http\Requests\Genre\UpdateGenreRequest;
use App\Models\Genre;
use App\Services\Genre\GenreService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GenreController extends Controller
{
    private GenreService $genreService;

    public function __construct(GenreService $genreService)
    {
        $this->genreService = $genreService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'search' => $request->search,
            'per_page' => $request->per_page,
        ];

        $genres = $this->genreService->getAll($filters);

        return ApiResponse::successResponse('Data genre berhasil diambil', $genres);
    }

    public function store(StoreGenreRequest $request): JsonResponse
    {
        $genre = $this->genreService->create($request->validated());

        return ApiResponse::successResponse('Genre berhasil ditambahkan', $genre, 201);
    }

    public function update(UpdateGenreRequest $request, Genre $genre): JsonResponse
    {
        $genre = $this->genreService->update($genre, $request->validated());

        return ApiResponse::successResponse('Genre berhasil diperbarui', $genre);
    }

    public function destroy(Genre $genre): JsonResponse
    {
        $data = $this->genreService->delete($genre);

        return ApiResponse::successResponse('Genre berhasil dihapus', $data);
    }
}
