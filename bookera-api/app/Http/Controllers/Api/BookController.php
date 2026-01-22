<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;

class BookController extends Controller
{
    public function index()
    {
        return Book::with(['categories', 'copies'])->latest()->get();
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
            'category_ids' => 'array'
        ]);

        $book = Book::create($data);

        if (!empty($data['category_ids'])) {
            $book->categories()->sync($data['category_ids']);
        }

        return response()->json($book->load('categories'), 201);
    }

    public function show(Book $book)
    {
        return $book->load(['categories', 'copies']);
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
            'category_ids' => 'array'
        ]);

        $book->update($data);

        if (isset($data['category_ids'])) {
            $book->categories()->sync($data['category_ids']);
        }

        return $book->load('categories');
    }

    public function destroy(Book $book)
    {
        $book->delete();
        return response()->json(['message' => 'Book deleted']);
    }
}
