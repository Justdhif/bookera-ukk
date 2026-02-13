<?php

namespace App\Services\BookCopy;

use App\Helpers\ActivityLogger;
use App\Models\Book;
use App\Models\BookCopy;

class BookCopyService
{
    public function createBookCopy(Book $book, array $data): BookCopy
    {
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

        return $copy;
    }

    public function deleteBookCopy(BookCopy $bookCopy): array
    {
        if ($bookCopy->status !== 'available') {
            throw new \Exception('Salinan buku sedang dipinjam dan tidak dapat dihapus');
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
