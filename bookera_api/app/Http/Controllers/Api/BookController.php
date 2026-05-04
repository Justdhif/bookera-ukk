<?php

namespace App\Http\Controllers\Api;

use App\Exports\BookExport;
use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Book\StoreBookRequest;
use App\Http\Requests\Book\UpdateBookRequest;
use App\Models\Book;
use App\Services\Book\BookService;
use App\Imports\BookImport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class BookController extends Controller
{
    private BookService $bookService;

    public function __construct(BookService $bookService)
    {
        $this->bookService = $bookService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $this->getFilters($request);

        $books = $this->bookService->getAll($filters);

        return ApiResponse::successResponse('Book data retrieved successfully', $books);
    }

    public function store(StoreBookRequest $request): JsonResponse
    {
        $book = $this->bookService->create(
            $request->validated(),
            $request->file('cover_image')
        );

        return ApiResponse::successResponse('Book added successfully', $book, 201);
    }





    public function update(UpdateBookRequest $request, Book $book): JsonResponse
    {
        $book = $this->bookService->update(
            $book,
            $request->validated(),
            $request->file('cover_image')
        );

        return ApiResponse::successResponse('Book updated successfully', $book);
    }

    public function show(int $id): JsonResponse
    {
        $book = $this->bookService->getById($id);

        if (!$book) {
            return ApiResponse::notFoundResponse('Book not found');
        }

        return ApiResponse::successResponse('Book details retrieved successfully', $book);
    }

    public function showBySlug(string $slug): JsonResponse
    {
        $book = $this->bookService->getBySlug($slug);

        if (!$book) {
            return ApiResponse::notFoundResponse('Book not found');
        }

        return ApiResponse::successResponse('Book details retrieved successfully', $book);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->bookService->delete($id);

        if (!$deleted) {
            return ApiResponse::errorResponse('Book not found', 404);
        }

        return ApiResponse::successResponse('Book deleted successfully', null);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:10240',
        ]);

        try {
            Excel::import(new BookImport, $request->file('file'));
            return ApiResponse::successResponse('Books imported successfully');
        } catch (\Exception $e) {
            return ApiResponse::errorResponse('Failed to import books: ' . $e->getMessage(), 500);
        }
    }

    public function export(Request $request): BinaryFileResponse
    {
        $filters = $this->getFilters($request);

        return Excel::download(
            new BookExport($this->bookService->getExportData($filters)),
            'books_data_' . now()->format('Y-m-d_H-i-s') . '.xlsx'
        );
    }

    private function getFilters(Request $request): array
    {
        return [
            'search' => $request->search,
            'category_ids' => $request->category_ids,
            'genre_ids' => $request->genre_ids,
            'status' => $request->status,
            'has_stock' => $request->has_stock,
            'per_page' => $request->per_page,
            'author_ids' => $request->author_ids,
            'publisher_ids' => $request->publisher_ids,
            'min_rating' => $request->min_rating,
            'max_rating' => $request->max_rating,
            'min_reviews' => $request->min_reviews,
        ];
    }

}
