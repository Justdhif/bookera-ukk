<?php

namespace App\Services\BookCopy;

use App\Helpers\ActivityLogger;
use App\Models\Book;
use App\Models\BookCopy;

class BookCopyService
{
    private \App\Services\Reservation\ReservationService $reservationService;

    public function __construct(\App\Services\Reservation\ReservationService $reservationService)
    {
        $this->reservationService = $reservationService;
    }

    public function create(Book $book, array $data): BookCopy
    {
        $copy = $book->copies()->create($data);
        $copy->load('book');

        // Notify next user in queue if any
        $this->reservationService->notifyAvailableWaiters($book->id);

        ActivityLogger::log(
            'create',
            'book_copy',
            "Created book copy {$copy->copy_code} for book: {$book->title}",
            $copy->toArray(),
            null,
            $copy
        );

        return $copy;
    }

    public function delete(BookCopy $bookCopy): array
    {
        if ($bookCopy->status !== 'available') {
            throw new \Exception('This book copy is currently borrowed and cannot be deleted');
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

        return ['deleted_copy_id' => $deletedCopyId];
    }
}
