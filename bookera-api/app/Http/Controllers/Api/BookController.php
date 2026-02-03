<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ActivityLogger;
use App\Helpers\ApiResponse;
use App\Helpers\SlugGenerator;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $books = Book::query()
            ->with(['categories', 'copies'])
            ->when($request->search, function ($q) use ($request) {
                $q->where(function ($sub) use ($request) {
                    $sub->where('title', 'like', "%{$request->search}%")
                        ->orWhere('author', 'like', "%{$request->search}%")
                        ->orWhere('isbn', 'like', "%{$request->search}%");
                });
            })
            ->when($request->category_ids, function ($q) use ($request) {
                $categoryIds = is_array($request->category_ids)
                    ? $request->category_ids
                    : explode(',', $request->category_ids);

                $q->whereHas('categories', function ($cat) use ($categoryIds) {
                    $cat->whereIn('categories.id', $categoryIds);
                });
            })
            ->when($request->status, function ($q) use ($request) {
                $q->where('is_active', $request->status === 'active');
            })
            ->when($request->has_stock, function ($q) {
                $q->whereHas('copies', function ($copy) {
                    $copy->where('status', 'available');
                });
            })
            ->latest()
            ->paginate($request->per_page ?? 10);

        // append cover_image_url
        $books->getCollection()->transform(function ($book) {
            $book->cover_image_url = storage_image($book->cover_image);
            return $book;
        });

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
            'language' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',

            'cover_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',

            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:categories,id',
        ]);

        $data['slug'] = SlugGenerator::generate(
            'books',
            'slug',
            $data['title']
        );

        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request
                ->file('cover_image')
                ->store('books/covers', 'public');
        }

        $book = Book::create($data);

        if (!empty($data['category_ids'])) {
            $book->categories()->sync($data['category_ids']);
        }

        $book->load(['categories', 'copies']);
        $book->cover_image_url = storage_image($book->cover_image);

        ActivityLogger::log(
            'create',
            'book',
            "Created book: {$book->title}",
            $book->toArray()
        );

        return ApiResponse::successResponse(
            'Buku berhasil ditambahkan',
            $book,
            201
        );
    }

    public function show($id)
    {
        $book = Book::find($id);
        if (!$book) {
            return ApiResponse::errorResponse('Buku tidak ditemukan', 404);
        }

        $book->load([
            'categories',
            'copies' => function ($q) {
                $q->orderBy('status')
                    ->orderBy('created_at');
            }
        ]);

        $book->cover_image_url = storage_image($book->cover_image);

        return ApiResponse::successResponse(
            'Detail buku',
            $book
        );
    }

    public function update(Request $request, Book $book)
    {
        if (!$book) {
            return ApiResponse::errorResponse('Buku tidak ditemukan', 404);
        }

        $data = $request->validate([
            'title' => 'required|string',
            'author' => 'required|string',
            'publisher' => 'nullable|string',
            'publication_year' => 'nullable|integer',
            'isbn' => 'nullable|string|unique:books,isbn,' . $book->id,
            'description' => 'nullable|string',
            'language' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',

            'cover_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',

            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:categories,id',
        ]);

        if ($data['title'] !== $book->title) {
            $data['slug'] = SlugGenerator::generate(
                'books',
                'slug',
                $data['title'],
                $book->id
            );
        }

        if ($request->hasFile('cover_image')) {
            if ($book->cover_image) {
                Storage::disk('public')->delete($book->cover_image);
            }

            $data['cover_image'] = $request
                ->file('cover_image')
                ->store('books/covers', 'public');
        }

        $oldData = $book->toArray();

        $book->update($data);

        if (array_key_exists('category_ids', $data)) {
            $book->categories()->sync($data['category_ids']);
        }

        $book->load(['categories', 'copies']);
        $book->cover_image_url = storage_image($book->cover_image);

        ActivityLogger::log(
            'update',
            'book',
            "Updated book: {$book->title}",
            $book->toArray(),
            $oldData
        );

        return ApiResponse::successResponse(
            'Buku berhasil diperbarui',
            $book
        );
    }

    public function destroy($id)
    {
        $book = Book::find($id);

        if (!$book) {
            return ApiResponse::errorResponse('Buku tidak ditemukan', 404);
        }

        $bookData = $book->toArray();
        $bookTitle = $book->title;

        $book->delete();

        ActivityLogger::log(
            'delete',
            'book',
            "Deleted book: {$bookTitle}",
            null,
            $bookData
        );

        return ApiResponse::successResponse(
            'Buku berhasil dihapus',
            null
        );
    }
}
