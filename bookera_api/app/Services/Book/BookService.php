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
        $query = Book::query()
            ->with(['categories', 'authors', 'publishers', 'reviews.user.profile', 'copies']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
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
        }

        if (!empty($filters['category_ids'])) {
            $categoryIds = is_array($filters['category_ids'])
                ? $filters['category_ids']
                : explode(',', $filters['category_ids']);

            $query->whereHas('categories', function ($categoryQuery) use ($categoryIds) {
                $categoryQuery->whereIn('categories.id', $categoryIds);
            });
        }

        if (isset($filters['min_rating']) && $filters['min_rating'] !== '') {
            $operator = !empty($filters['min_rating_exclusive']) ? '>' : '>=';
            $query->whereRaw(
                "(SELECT COALESCE(AVG(rating), 0) FROM book_reviews WHERE book_reviews.book_id = books.id) {$operator} ?",
                [(float) $filters['min_rating']]
            );
        }

        if (isset($filters['max_rating']) && $filters['max_rating'] !== '') {
            $operator = !empty($filters['max_rating_exclusive']) ? '<' : '<=';
            $query->whereRaw(
                "(SELECT COALESCE(AVG(rating), 0) FROM book_reviews WHERE book_reviews.book_id = books.id) {$operator} ?",
                [(float) $filters['max_rating']]
            );
        }

        if (isset($filters['min_reviews']) && $filters['min_reviews'] !== '') {
            $query->has('reviews', '>=', (int) $filters['min_reviews']);
        }

        if (!empty($filters['author_ids'])) {
            $authorIds = is_array($filters['author_ids'])
                ? $filters['author_ids']
                : explode(',', $filters['author_ids']);

            $query->whereHas('authors', function ($authorQuery) use ($authorIds) {
                $authorQuery->whereIn('authors.id', $authorIds);
            });
        }

        if (!empty($filters['publisher_ids'])) {
            $publisherIds = is_array($filters['publisher_ids'])
                ? $filters['publisher_ids']
                : explode(',', $filters['publisher_ids']);

            $query->whereHas('publishers', function ($publisherQuery) use ($publisherIds) {
                $publisherQuery->whereIn('publishers.id', $publisherIds);
            });
        }

        if (!empty($filters['author_ids'])) {
            $authorIds = is_array($filters['author_ids'])
                ? $filters['author_ids']
                : explode(',', $filters['author_ids']);

            $query->whereHas('authors', function ($authorQuery) use ($authorIds) {
                $authorQuery->whereIn('authors.id', $authorIds);
            });
        }

        if (!empty($filters['publisher_ids'])) {
            $publisherIds = is_array($filters['publisher_ids'])
                ? $filters['publisher_ids']
                : explode(',', $filters['publisher_ids']);

            $query->whereHas('publishers', function ($publisherQuery) use ($publisherIds) {
                $publisherQuery->whereIn('publishers.id', $publisherIds);
            });
        }

        if (!empty($filters['status'])) {
            $query->where('is_active', $filters['status'] === 'active');
        }

        if (isset($filters['has_stock']) && filter_var($filters['has_stock'], FILTER_VALIDATE_BOOLEAN)) {
            $query->whereHas('copies', function ($copyQuery) {
                $copyQuery->where('status', 'available');
            });
        }

        return $query->latest()->orderByDesc('id')->paginate($filters['per_page'] ?? 15);
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
            throw new \Exception('Cannot delete a book that has borrowed copies. Wait until all copies are returned.', 422);
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
