<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ApiResponse;
use App\Models\Book;
use App\Models\BookCopy;
use Illuminate\Http\Request;

class BookCopyController extends Controller
{
    public function store(Request $request, Book $book)
    {
        $data = $request->validate([
            'copy_code' => 'required|string|unique:book_copies,copy_code',
            'status' => 'nullable|string|default:available',
        ]);

        $copy = $book->copies()->create($data);

        $copy->load('book');

        return ApiResponse::successResponse(
            'Salinan buku berhasil ditambahkan',
            $copy,
            201
        );
    }

    public function destroy(BookCopy $bookCopy)
    {
        if ($bookCopy->status !== 'available') {
            return ApiResponse::errorResponse(
                'Salinan buku sedang dipinjam dan tidak dapat dihapus',
                null,
                422
            );
        }

        $deletedCopyId = $bookCopy->id;

        $bookCopy->delete();

        return ApiResponse::successResponse(
            'Salinan buku berhasil dihapus',
            [
                'deleted_copy_id' => $deletedCopyId,
            ]
        );
    }
}
