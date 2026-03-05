<?php

namespace App\Services\Book;

use App\Helpers\ActivityLogger;
use App\Helpers\SlugGenerator;
use App\Models\Author;
use App\Models\Book;
use App\Models\Publisher;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class BookService
{
    public function getBooks(array $filters): LengthAwarePaginator
    {
        $books = Book::query()
            ->with(['categories', 'copies'])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('title', 'like', "%{$search}%")
                        ->orWhere('author', 'like', "%{$search}%")
                        ->orWhere('isbn', 'like', "%{$search}%");
                });
            })
            ->when($filters['category_ids'] ?? null, function ($query, $categoryIds) {
                $categoryIds = is_array($categoryIds) ? $categoryIds : explode(',', $categoryIds);
                $query->whereHas('categories', function ($categoryQuery) use ($categoryIds) {
                    $categoryQuery->whereIn('categories.id', $categoryIds);
                });
            })
            ->when($filters['status'] ?? null, function ($query, $status) {
                $query->where('is_active', $status === 'active');
            })
            ->when($filters['has_stock'] ?? false, function ($query) {
                $query->whereHas('copies', function ($copyQuery) {
                    $copyQuery->where('status', 'available');
                });
            })
            ->latest()
            ->paginate($filters['per_page'] ?? 10);

        $books->getCollection()->transform(function ($book) {
            $book->cover_image_url = storage_image($book->cover_image);
            $book->total_copies = $book->copies->count();
            $book->available_copies = $book->copies->where('status', 'available')->count();
            return $book;
        });

        return $books;
    }

    public function createBook(array $data, ?UploadedFile $coverImage = null): Book
    {
        $data['slug'] = SlugGenerator::generate('books', 'slug', $data['title']);

        if ($coverImage) {
            $data['cover_image'] = $coverImage->store('books/covers', 'public');
        }

        if (!empty($data['author_ids'])) {
            $authorNames = Author::whereIn('id', $data['author_ids'])->pluck('name');
            $data['author'] = $authorNames->join(', ');
        }

        if (!empty($data['publisher_ids'])) {
            $publisherNames = Publisher::whereIn('id', $data['publisher_ids'])->pluck('name');
            $data['publisher'] = $publisherNames->join(', ');
        }

        $book = Book::create($data);

        if (!empty($data['category_ids'])) {
            $book->categories()->sync($data['category_ids']);
        }

        if (!empty($data['author_ids'])) {
            $book->authors()->sync($data['author_ids']);
        }

        if (!empty($data['publisher_ids'])) {
            $book->publishers()->sync($data['publisher_ids']);
        }

        $book->load(['categories', 'authors', 'publishers', 'copies']);
        $book->cover_image_url = storage_image($book->cover_image);

        ActivityLogger::log(
            'create',
            'book',
            "Created book: {$book->title}",
            $book->toArray(),
            null,
            $book
        );

        return $book;
    }

    public function getBookById(int $id): ?Book
    {
        $book = Book::find($id);

        if (!$book) {
            return null;
        }

        return $this->loadBookDetails($book);
    }

    public function getBookBySlug(string $slug): ?Book
    {
        $book = Book::where('slug', $slug)->first();

        if (!$book) {
            return null;
        }

        return $this->loadBookDetails($book);
    }

    public function updateBook(Book $book, array $data, ?UploadedFile $coverImage = null): Book
    {
        if ($data['title'] !== $book->title) {
            $data['slug'] = SlugGenerator::generate('books', 'slug', $data['title'], $book->id);
        }

        if ($coverImage) {
            if ($book->cover_image) {
                Storage::disk('public')->delete($book->cover_image);
            }
            $data['cover_image'] = $coverImage->store('books/covers', 'public');
        }

        if (!empty($data['author_ids'])) {
            $authorNames = Author::whereIn('id', $data['author_ids'])->pluck('name');
            $data['author'] = $authorNames->join(', ');
        }

        if (!empty($data['publisher_ids'])) {
            $publisherNames = Publisher::whereIn('id', $data['publisher_ids'])->pluck('name');
            $data['publisher'] = $publisherNames->join(', ');
        }

        $oldData = $book->toArray();

        $book->update($data);

        if (array_key_exists('category_ids', $data)) {
            $book->categories()->sync($data['category_ids']);
        }

        if (array_key_exists('author_ids', $data)) {
            $book->authors()->sync($data['author_ids'] ?? []);
        }

        if (array_key_exists('publisher_ids', $data)) {
            $book->publishers()->sync($data['publisher_ids'] ?? []);
        }

        $book->load(['categories', 'authors', 'publishers', 'copies']);
        $book->cover_image_url = storage_image($book->cover_image);

        ActivityLogger::log(
            'update',
            'book',
            "Updated book: {$book->title}",
            $book->toArray(),
            $oldData,
            $book
        );

        return $book;
    }

    public function deleteBook(int $id): bool
    {
        $book = Book::find($id);

        if (!$book) {
            return false;
        }

        $bookData = $book->toArray();
        $bookTitle = $book->title;

        $book->delete();

        ActivityLogger::log(
            'delete',
            'book',
            "Deleted book: {$bookTitle}",
            null,
            $bookData,
            null
        );

        return true;
    }

    private function loadBookDetails(Book $book): Book
    {
        $book->load([
            'categories',
            'authors',
            'publishers',
            'copies' => function ($query) {
                $query->orderBy('status')->orderBy('created_at');
            }
        ]);

        $book->cover_image_url = storage_image($book->cover_image);
        $book->total_copies = $book->copies->count();
        $book->available_copies = $book->copies->where('status', 'available')->count();

        $book->authors->each(function ($author) {
            $author->photo_url = storage_image($author->photo);
        });

        $book->publishers->each(function ($publisher) {
            $publisher->photo_url = storage_image($publisher->photo);
        });

        return $book;
    }
}
