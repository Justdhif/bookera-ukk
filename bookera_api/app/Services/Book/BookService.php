<?php

namespace App\Services\Book;

use App\Helpers\ActivityLogger;
use App\Helpers\SlugGenerator;
use App\Models\Book;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class BookService
{
    public function getAll(array $filters): LengthAwarePaginator
    {
        return Book::query()
            ->with(['categories', 'authors', 'publishers', 'reviews.user.profile', 'copies'])
            ->withCount([
                'copies as total_copies',
                'copies as available_copies' => function ($query) {
                    $query->where('status', 'available');
                }
            ])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('title', 'like', "%{$search}%")
                        ->orWhere('isbn', 'like', "%{$search}%")
                        ->orWhereHas('authors', function ($authorQuery) use ($search) {
                            $authorQuery->where('name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('publishers', function ($publisherQuery) use ($search) {
                            $publisherQuery->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($filters['category_ids'] ?? null, function ($query, $categoryIds) {
                $categoryIds = is_array($categoryIds) ? $categoryIds : explode(',', $categoryIds);
                $query->whereHas('categories', function ($categoryQuery) use ($categoryIds) {
                    $categoryQuery->whereIn('categories.id', $categoryIds);
                });
            })
            ->when(isset($filters['status']), function ($query) use ($filters) {
                $query->where('is_active', $filters['status'] === 'active');
            })
            ->when($filters['has_stock'] ?? false, function ($query) {
                $query->whereHas('copies', function ($copyQuery) {
                    $copyQuery->where('status', 'available');
                });
            })
            ->latest()
            ->orderByDesc('id')
            ->paginate($filters['per_page'] ?? 10);
    }

    public function create(array $data, ?UploadedFile $coverImage = null): Book
    {
        $data['slug'] = SlugGenerator::generate('books', 'slug', $data['title']);

        if ($coverImage) {
            $data['cover_image'] = $coverImage->store('books/covers', 'public');
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

        $book->load(['categories', 'authors', 'publishers', 'copies', 'reviews']);

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

    public function getById(int $id): ?Book
    {
        $book = Book::find($id);

        if (!$book) {
            return null;
        }

        return $this->loadBookDetails($book);
    }

    public function getBySlug(string $slug): ?Book
    {
        $book = Book::where('slug', $slug)->first();

        if (!$book) {
            return null;
        }

        return $this->loadBookDetails($book);
    }

    public function update(Book $book, array $data, ?UploadedFile $coverImage = null): Book
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

        $book->load(['categories', 'authors', 'publishers', 'copies', 'reviews.user.profile']);

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

    public function delete(int $id): bool
    {
        $book = Book::find($id);

        if (!$book) {
            return false;
        }

        $borrowedCopiesCount = $book->copies()->where('status', 'borrowed')->count();
        if ($borrowedCopiesCount > 0) {
            throw new \Exception('Tidak dapat menghapus buku yang memiliki salinan sedang dipinjam. Tunggu hingga semua salinan dikembalikan.', 422);
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
            'reviews.user.profile',
            'copies' => function ($query) {
                $query->orderBy('status')->orderBy('created_at');
            }
        ])->loadCount([
            'copies as total_copies',
            'copies as available_copies' => function ($query) {
                $query->where('status', 'available');
            }
        ]);

        $book->authors->each(function ($author) {
            $author->photo_url = storage_image($author->photo);
        });

        $book->publishers->each(function ($publisher) {
            $publisher->photo_url = storage_image($publisher->photo);
        });

        return $book;
    }
}
