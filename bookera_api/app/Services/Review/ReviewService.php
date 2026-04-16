<?php

namespace App\Services\Review;

use App\Helpers\ActivityLogger;
use App\Models\BookReview;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ReviewService
{
    public function __construct()
    {
    }
    public function getByBookId(int $bookId, array $filters): LengthAwarePaginator
    {
        $query = BookReview::with(['user.profile'])
            ->where('book_id', $bookId)
            ->latest('id');

        return $query->paginate($filters['per_page'] ?? 10);
    }

    public function createOrUpdate(array $data): BookReview
    {
        $review = BookReview::updateOrCreate(
            [
                'user_id' => auth()->id(),
                'book_id' => $data['book_id'],
            ],
            [
                'rating' => $data['rating'],
                'review' => $data['review'] ?? null,
            ]
        );

        ActivityLogger::log(
            $review->wasRecentlyCreated ? 'create' : 'update',
            'Review',
            $review->wasRecentlyCreated ? "Posted a book review for book ID {$data['book_id']}" : "Updated a book review for book ID {$data['book_id']}",
            ['rating' => $data['rating']],
            null,
            $review
        );

        return $review;
    }

    public function delete(int $bookId): void
    {
        $review = BookReview::where('user_id', auth()->id())
            ->where('book_id', $bookId)
            ->first();

        if (!$review) {
            throw new \Exception('Review not found');
        }

        $oldData = $review->toArray();
        $review->delete();

        ActivityLogger::log(
            'delete',
            'Review',
            "Deleted book review for book ID {$bookId}",
            null,
            $oldData,
        );
    }

    public function check(int $bookId): ?BookReview
    {
        return BookReview::where('user_id', auth()->id())
            ->where('book_id', $bookId)
            ->first();
    }
}
