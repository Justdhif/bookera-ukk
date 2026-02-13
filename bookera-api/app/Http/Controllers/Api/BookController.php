<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Book\StoreBookRequest;
use App\Http\Requests\Book\UpdateBookRequest;
use App\Models\Book;
use App\Services\Book\BookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookController extends Controller
{
    private BookService $bookService;

    public function __construct(BookService $bookService)
    {
        $this->bookService = $bookService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'search' => $request->search,
            'category_ids' => $request->category_ids,
            'status' => $request->status,
            'has_stock' => $request->has_stock,
            'per_page' => $request->per_page
        ];

        $books = $this->bookService->getBooks($filters);

        return ApiResponse::successResponse('Data buku berhasil diambil', $books);
    }

    public function store(StoreBookRequest $request): JsonResponse
    {
        $book = $this->bookService->createBook(
            $request->validated(),
            $request->file('cover_image')
        );

        return ApiResponse::successResponse('Buku berhasil ditambahkan', $book, 201);
    }

    public function show(int $id): JsonResponse
    {
        $book = $this->bookService->getBookById($id);

        if (!$book) {
            return ApiResponse::errorResponse('Buku tidak ditemukan', 404);
        }

        return ApiResponse::successResponse('Detail buku', $book);
    }

    public function showBySlug(string $slug): JsonResponse
    {
        $book = $this->bookService->getBookBySlug($slug);

        if (!$book) {
            return ApiResponse::errorResponse('Buku tidak ditemukan', 404);
        }

        return ApiResponse::successResponse('Detail buku', $book);
    }

    public function update(UpdateBookRequest $request, Book $book): JsonResponse
    {
        $book = $this->bookService->updateBook(
            $book,
            $request->validated(),
            $request->file('cover_image')
        );

        return ApiResponse::successResponse('Buku berhasil diperbarui', $book);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->bookService->deleteBook($id);

        if (!$deleted) {
            return ApiResponse::errorResponse('Buku tidak ditemukan', 404);
        }

        return ApiResponse::successResponse('Buku berhasil dihapus', null);
    }
}

