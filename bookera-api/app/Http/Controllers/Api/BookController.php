<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ApiResponse;
use App\Models\Book;
use Illuminate\Http\Request;

class BookController extends Controller
{
    public function index()
    {
        $books = Book::with(['categories', 'copies'])
            ->latest()
            ->get();

        return ApiResponse::successResponse(
            'Data buku berhasil diambil',
            $books
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'author' => 'required|string',
            'publisher' => 'nullable|string',
            'publication_year' => 'nullable|integer',
            'isbn' => 'nullable|string|unique:books,isbn',
            'description' => 'nullable|string',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:categories,id',
        ]);

        $book = Book::create($data);

        if (!empty($data['category_ids'])) {
            $book->categories()->sync($data['category_ids']);
        }

        $book->load(['categories', 'copies']);

        return ApiResponse::successResponse(
            'Buku berhasil ditambahkan',
            $book,
            201
        );
    }

    public function show(Book $book)
    {
        $book->load(['categories', 'copies']);

        return ApiResponse::successResponse(
            'Detail buku',
            $book
        );
    }

    public function update(Request $request, Book $book)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'author' => 'required|string',
            'publisher' => 'nullable|string',
            'publication_year' => 'nullable|integer',
            'isbn' => 'nullable|string|unique:books,isbn,' . $book->id,
            'description' => 'nullable|string',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:categories,id',
        ]);

        $book->update($data);

        if (array_key_exists('category_ids', $data)) {
            $book->categories()->sync($data['category_ids']);
        }

        $book->load(['categories', 'copies']);

        return ApiResponse::successResponse(
            'Buku berhasil diperbarui',
            $book
        );
    }

    public function destroy(Book $book)
    {
        $book->delete();

        return ApiResponse::successResponse(
            'Buku berhasil dihapus',
            null
        );
    }
}
