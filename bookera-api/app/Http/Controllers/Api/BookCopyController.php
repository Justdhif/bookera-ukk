<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ActivityLogger;
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

        ActivityLogger::log(
            'create',
            'book_copy',
            "Created book copy {$copy->copy_code} for book: {$book->title}",
            $copy->toArray(),
            null,
            $copy
        );

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
        $oldData = $bookCopy->toArray();

        $bookCopy->delete();

        ActivityLogger::log(
            'delete',
            'book_copy',
            "Deleted book copy {$oldData['copy_code']}",
            null,
            $oldData,
            null
        );

        return ApiResponse::successResponse(
            'Salinan buku berhasil dihapus',
            [
                'deleted_copy_id' => $deletedCopyId,
            ]
        );
    }
}
