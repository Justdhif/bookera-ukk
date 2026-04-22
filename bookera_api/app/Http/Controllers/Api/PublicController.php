<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Services\Public\PublicService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    public function __construct(
        private PublicService $publicService,
    ) {
    }

    /**
     * Display a listing of books.
     */
    public function books(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search', 'category_ids', 'rating', 'min_reviews',
            'status', 'has_stock', 'author_ids', 'publisher_ids',
            'per_page', 'page'
        ]);

        $books = $this->publicService->getAllBooks($filters);

        return ApiResponse::successResponse('Book data retrieved successfully', $books);
    }



    /**
     * Display the specified book by slug.
     */
    public function bookBySlug(string $slug): JsonResponse
    {
        $book = $this->publicService->getBookBySlug($slug);

        if (!$book) {
            return ApiResponse::errorResponse('Book not found', null, 404);
        }

        return ApiResponse::successResponse('Book details', $book);
    }

    /**
     * Display the specified book by ID.
     */
    public function bookById(int $id): JsonResponse
    {
        $book = $this->publicService->getBookById($id);

        if (!$book) {
            return ApiResponse::errorResponse('Book not found', null, 404);
        }

        return ApiResponse::successResponse('Book details', $book);
    }

    /**
     * Display a listing of authors.
     */
    public function authors(Request $request): JsonResponse
    {
        $authors = $this->publicService->getAllAuthors($request->all());

        return ApiResponse::successResponse('Data penulis berhasil diambil', $authors);
    }



    /**
     * Display the specified author by slug.
     */
    public function authorBySlug(string $slug): JsonResponse
    {
        $author = $this->publicService->getAuthorBySlug($slug);

        if (!$author) {
            return ApiResponse::errorResponse('Penulis tidak ditemukan', null, 404);
        }

        return ApiResponse::successResponse('Data penulis berhasil diambil', $author);
    }

    /**
     * Display a listing of publishers.
     */
    public function publishers(Request $request): JsonResponse
    {
        $publishers = $this->publicService->getAllPublishers($request->all());

        return ApiResponse::successResponse('Data penerbit berhasil diambil', $publishers);
    }



    /**
     * Display the specified publisher by slug.
     */
    public function publisherBySlug(string $slug): JsonResponse
    {
        $publisher = $this->publicService->getPublisherBySlug($slug);

        if (!$publisher) {
            return ApiResponse::errorResponse('Penerbit tidak ditemukan', null, 404);
        }

        return ApiResponse::successResponse('Data penerbit berhasil diambil', $publisher);
    }

    /**
     * Display a listing of categories.
     */
    public function categories(Request $request): JsonResponse
    {
        $categories = $this->publicService->getAllCategories($request->all());

        return ApiResponse::successResponse('Data kategori berhasil diambil', $categories);
    }
}
