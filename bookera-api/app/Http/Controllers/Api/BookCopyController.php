<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\BookCopy\StoreBookCopyRequest;
use App\Models\Book;
use App\Models\BookCopy;
use App\Services\BookCopy\BookCopyService;
use Illuminate\Http\JsonResponse;

class BookCopyController extends Controller
{
    private BookCopyService $bookCopyService;

    public function __construct(BookCopyService $bookCopyService)
    {
        $this->bookCopyService = $bookCopyService;
    }

    public function store(StoreBookCopyRequest $request, Book $book): JsonResponse
    {
        $copy = $this->bookCopyService->createBookCopy($book, $request->validated());

        return ApiResponse::successResponse('Salinan buku berhasil ditambahkan', $copy, 201);
    }

    public function destroy(BookCopy $bookCopy): JsonResponse
    {
        try {
            $data = $this->bookCopyService->deleteBookCopy($bookCopy);

            return ApiResponse::successResponse('Salinan buku berhasil dihapus', $data);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 422);
        }
    }
}

