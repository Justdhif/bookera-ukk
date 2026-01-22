<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookCopy;
use Illuminate\Http\Request;

class BookCopyController extends Controller
{
    public function store(Request $request, Book $book)
    {
        $data = $request->validate([
            'copy_code' => 'required|string|unique:book_copies,copy_code'
        ]);

        return $book->copies()->create($data);
    }

    public function destroy(BookCopy $bookCopy)
    {
        if ($bookCopy->status !== 'available') {
            return response()->json([
                'message' => 'Book copy is currently borrowed'
            ], 422);
        }

        $bookCopy->delete();
        return response()->json(['message' => 'Copy deleted']);
    }
}
