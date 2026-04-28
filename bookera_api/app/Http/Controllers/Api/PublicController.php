<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Services\Public\PublicService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    private PublicService $publicService;

    public function __construct(PublicService $publicService)
    {
        $this->publicService = $publicService;
    }

    /**
     * Display a listing of books.
     */
    public function books(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search', 'category_ids', 'genre_ids', 'rating', 'min_reviews',
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

    /**
     * Display a listing of public users.
     */
    public function users(Request $request): JsonResponse
    {
        $users = $this->publicService->getAllUsers($request->all());

        return ApiResponse::successResponse('Public user data retrieved successfully', $users);
    }

    /**
     * Display a listing of top discussions.
     */
    public function topDiscussions(): JsonResponse
    {
        $discussions = $this->publicService->getTopDiscussions(10);

        return ApiResponse::successResponse('Top discussions retrieved successfully', $discussions);
    }

    /**
     * Display a listing of all discussions.
     */
    public function discussions(): JsonResponse
    {
        $perPage = request('per_page', 12);
        $search = request('search');
        $discussions = $this->publicService->getAllDiscussions($perPage, $search);

        return ApiResponse::successResponse('Discussions retrieved successfully', $discussions);
    }
}
