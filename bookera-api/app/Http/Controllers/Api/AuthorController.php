<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Author\StoreAuthorRequest;
use App\Http\Requests\Author\UpdateAuthorRequest;
use App\Models\Author;
use App\Services\Author\AuthorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthorController extends Controller
{
    private AuthorService $authorService;

    public function __construct(AuthorService $authorService)
    {
        $this->authorService = $authorService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'search'   => $request->search,
            'is_active' => $request->has('is_active') ? filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN) : null,
            'per_page' => $request->per_page,
        ];

        if (is_null($filters['is_active'])) {
            unset($filters['is_active']);
        }

        $authors = $this->authorService->getAuthors($filters);

        return ApiResponse::successResponse('Data penulis berhasil diambil', $authors);
    }

    public function list(): JsonResponse
    {
        $authors = $this->authorService->getAllAuthors();

        return ApiResponse::successResponse('Daftar penulis berhasil diambil', $authors);
    }

    public function store(StoreAuthorRequest $request): JsonResponse
    {
        $author = $this->authorService->createAuthor(
            $request->validated(),
            $request->file('photo')
        );

        return ApiResponse::successResponse('Penulis berhasil ditambahkan', $author, 201);
    }

    public function show(Author $author): JsonResponse
    {
        $author = $this->authorService->getAuthorById($author->id);

        if (!$author) {
            return ApiResponse::errorResponse('Penulis tidak ditemukan', null, 404);
        }

        return ApiResponse::successResponse('Data penulis berhasil diambil', $author);
    }

    public function update(UpdateAuthorRequest $request, Author $author): JsonResponse
    {
        $author = $this->authorService->updateAuthor(
            $author,
            $request->validated(),
            $request->file('photo')
        );

        return ApiResponse::successResponse('Penulis berhasil diperbarui', $author);
    }

    public function destroy(Author $author): JsonResponse
    {
        $data = $this->authorService->deleteAuthor($author);

        return ApiResponse::successResponse('Penulis berhasil dihapus', $data);
    }
}
