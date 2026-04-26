<?php

namespace App\Services\LostBook;

use App\Helpers\ActivityLogger;
use App\Models\BookCopy;
use App\Models\Borrow;
use App\Models\FineBorrow;
use App\Models\FineType;
use App\Models\LostBook;
use App\Models\User;
use App\Services\BookReturn\BookReturnNotificationService;
use App\Services\NotificationService as DatabaseNotificationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class LostBookService
{
    public function markBorrowDetailsLost(Borrow $borrow, array $borrowDetailIds): Borrow
    {
        return DB::transaction(fn() => $this->processMarkBorrowDetailsLost($borrow, $borrowDetailIds));
    }

    private function processMarkBorrowDetailsLost(Borrow $borrow, array $ids): Borrow
    {
        abort_if($borrow->status !== 'open', 400, 'This borrow is not in open status');

        $details = $borrow->borrowDetails()->with('bookCopy.book.genres')->whereIn('id', array_unique($ids))->get();
        abort_if($details->count() !== count(array_unique($ids)), 400, 'Invalid borrow details');

        $details->each(function ($detail) use ($borrow) {
            abort_if($detail->status !== 'borrowed', 400, 'Book already processed');

            $copy = $detail->bookCopy;
            $oldStatus = $copy->status;
            $detail->update(['status' => 'lost']);
            $copy->update(['status' => 'lost']);

            ActivityLogger::log('update', 'borrow_detail', "Book {$copy->book->title} lost",
                ['detail_id' => $detail->id, 'copy_id' => $copy->id, 'borrow_id' => $borrow->id, 'new_status' => 'lost'],
                ['detail_id' => $detail->id, 'copy_id' => $copy->id, 'old_status' => $oldStatus],
                $detail
            );
        });

        $this->notifyLostBooks($borrow, $details);

        return $borrow->load([
            'borrowDetails.bookCopy.book.authors', 'borrowDetails.bookCopy.book.publishers',
            'borrowDetails.bookCopy.book.categories', 'borrowDetails.bookCopy.book.genres', 'borrowRequest.borrowRequestDetails.book',
            'user.profile', 'bookReturns.details.bookCopy.book.authors', 'fines.fineType',
            'lostBooks.details.bookCopy.book.authors'
        ]);
    }

    private function notifyLostBooks(Borrow $borrow, $details): void
    {
        $summary = $details->map(fn($d) => [
            'copy_id' => $d->book_copy_id, 'book_title' => $d->bookCopy->book->title,
            'cover' => $d->bookCopy->book->cover_image, 'author' => $d->bookCopy->book->author
        ])->toArray();

        (new BookReturnNotificationService())->notifyReturnProcessed($borrow, ['lost' => $summary]);

        $borrow->loadMissing('user.profile');
        $name = $borrow->user?->profile?->full_name ?? $borrow->user?->email ?? 'User';
        $titles = collect($summary)->take(2)->pluck('book_title')->implode(', ') . (count($summary) > 2 ? '...' : '');
        $msg = "{$name} reported lost books: {$titles} (Borrow #{$borrow->id})";

        User::where('role', 'admin')->get()->each(fn($admin) =>
            DatabaseNotificationService::send($admin->id, 'Lost Book Reported', $msg, 'lost_book_reported', 'borrow', [
                'borrow_id' => $borrow->id,
                'user' => ['name' => $name, 'avatar' => $borrow->user?->profile?->avatar],
                'books' => array_slice($summary, 0, 5)
            ])
        );
    }

    public function getAll(array $filters): LengthAwarePaginator
    {
        return $this->buildQuery($filters)->paginate($filters['per_page'] ?? 15);
    }

    public function getExportData(array $filters): Collection
    {
        return $this->buildQuery($filters)->get();
    }

    private function buildQuery(array $filters)
    {
        $applyDateRange = function ($detailQuery) use ($filters) {
            if (!empty($filters['start_date'])) {
                $detailQuery->whereDate('lost_date', '>=', $filters['start_date']);
            }

            if (!empty($filters['end_date'])) {
                $detailQuery->whereDate('lost_date', '<=', $filters['end_date']);
            }
        };

        $query = LostBook::with([
            'borrow.user.profile',
            'borrow.fines.fineType',
            'details' => function ($detailQuery) use ($applyDateRange) {
                $detailQuery->with(['bookCopy.book.authors', 'bookCopy.book.publishers', 'bookCopy.book.categories', 'bookCopy.book.genres'])
                    ->orderBy('id');

                $applyDateRange($detailQuery);
            },
        ]);

        $query->whereHas('details', $applyDateRange);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($lostBookQuery) use ($search, $applyDateRange) {
                $lostBookQuery->where('id', 'like', "%{$search}%")
                    ->orWhere('borrow_id', 'like', "%{$search}%")
                    ->orWhereHas('borrow.user', function ($userQuery) use ($search) {
                        $userQuery->where('email', 'like', "%{$search}%")
                            ->orWhereHas('profile', function ($profileQuery) use ($search) {
                                $profileQuery->where('full_name', 'like', "%{$search}%");
                            });
                    })
                    ->orWhereHas('details', function ($detailQuery) use ($search, $applyDateRange) {
                        $applyDateRange($detailQuery);

                        $detailQuery->where(function ($nestedQuery) use ($search) {
                            $nestedQuery->where('notes', 'like', "%{$search}%")
                                ->orWhereHas('bookCopy.book', function ($bookQuery) use ($search) {
                                    $bookQuery->where('title', 'like', "%{$search}%");
                                })
                                ->orWhereHas('bookCopy', function ($copyQuery) use ($search) {
                                    $copyQuery->where('copy_code', 'like', "%{$search}%");
                                });
                        });
                    });
            });
        }

        return $query->latest()->orderByDesc('id');
    }

    public function createMany(Borrow $borrow, array $items): LostBook
    {
        return DB::transaction(fn() => $this->processCreateMany($borrow, $items));
    }

    private function processCreateMany(Borrow $borrow, array $items): LostBook
    {
        $lostBook = LostBook::firstOrCreate(['borrow_id' => $borrow->id]);

        foreach ($items as $item) {
            $copy = BookCopy::where('id', $item['book_copy_id'])->lockForUpdate()->firstOrFail()->loadMissing('book.genres');
            $oldStatus = $copy->status;

            $detail = $lostBook->details()->create([
                'book_copy_id' => $copy->id,
                'lost_date' => $item['lost_date'] ?? now()->toDateString(),
                'notes' => $item['notes'] ?? null
            ]);

            $copy->update(['status' => 'lost']);
            $borrow->borrowDetails()->where('book_copy_id', $copy->id)->update(['status' => 'lost']);

            ActivityLogger::log('update', 'book_copy', "Book {$copy->book->title} lost",
                ['copy_id' => $copy->id, 'new_status' => 'lost', 'borrow_id' => $borrow->id],
                ['copy_id' => $copy->id, 'old_status' => $oldStatus], $copy
            );

            ActivityLogger::log('create', 'lost_book_detail', "Lost detail for {$copy->book->title}",
                ['id' => $detail->id, 'lost_id' => $lostBook->id, 'date' => $detail->lost_date], null, $detail
            );

            $this->autoCreateLostFine($borrow, $copy);
        }

        ActivityLogger::log('create', 'lost_book', "Lost book reported for borrow #{$borrow->id}",
            ['id' => $lostBook->id, 'borrow_id' => $borrow->id], null, $lostBook
        );

        return $lostBook->load(['borrow.user.profile', 'details.bookCopy.book.genres', 'borrow.fines.fineType']);
    }

    private function autoCreateLostFine(Borrow $borrow, BookCopy $bookCopy): void
    {
        $lostFineType = FineType::where('type', 'lost')->orderBy('amount')->orderBy('id')->first();

        if (!$lostFineType) {
            return;
        }

        $percentage = (float) ($lostFineType->percentage ?? 100);
        $amount = round(((float) ($bookCopy->book->price ?? 0) * $percentage) / 100, 2);

        $fineNotes = 'Denda buku hilang (' . $lostFineType->name . '): ' . $bookCopy->book->title . ' (Copy: ' . $bookCopy->copy_code . ')';

        $existingFine = $borrow->fines()
            ->where('fine_type_id', $lostFineType->id)
            ->where('notes', 'like', '%' . $bookCopy->copy_code . '%')
            ->first();

        if ($existingFine) {
            return;
        }

        $fine = FineBorrow::create([
            'borrow_id' => $borrow->id,
            'fine_type_id' => $lostFineType->id,
            'amount' => $amount,
            'status' => 'unpaid',
            'notes' => $fineNotes,
        ]);

        ActivityLogger::log(
            'create',
            'fine',
            "Fine auto-created for lost book in borrow #{$borrow->id} ({$lostFineType->name})",
            ['fine_id' => $fine->id, 'amount' => $fine->amount, 'book_copy_id' => $bookCopy->id],
            null,
            $fine
        );

        $fine->load('fineType', 'borrow.user', 'borrow.borrowDetails.bookCopy.book');
    }

    public function delete(LostBook $lostBook): void
    {
        $lostBook->loadMissing(['borrow', 'details.bookCopy.book.genres']);

        ActivityLogger::log(
            'delete',
            'lost_book',
            "Lost book record #{$lostBook->id} deleted",
            [
                'lost_book_id' => $lostBook->id,
                'borrow_id' => $lostBook->borrow_id,
                'detail_ids' => $lostBook->details->pluck('id')->values()->all(),
            ],
            null,
            $lostBook
        );

        foreach ($lostBook->details as $detail) {
            $bookCopy = $detail->bookCopy;

            if ($bookCopy) {
                $fineNotes = 'Denda buku hilang: ' . $bookCopy->book->title . ' (Copy: ' . $bookCopy->copy_code . ')';
                $lostBook->borrow->fines()->where('notes', $fineNotes)->delete();

                if ($lostBook->borrow->status === 'open') {
                    $bookCopy->update(['status' => 'borrowed']);
                }
            }

            ActivityLogger::log(
                'delete',
                'lost_book_detail',
                "Lost book detail #{$detail->id} deleted",
                [
                    'lost_book_detail_id' => $detail->id,
                    'lost_book_id' => $lostBook->id,
                    'book_copy_id' => $detail->book_copy_id,
                    'lost_date' => $detail->lost_date ? (string) $detail->lost_date : null,
                    'notes' => $detail->notes,
                ],
                null,
                $detail
            );
        }

        $lostBook->details()->delete();
        $lostBook->delete();
    }

    public function removeByBorrowAndCopy(Borrow $borrow, int $bookCopyId): void
    {
        $lostBook = LostBook::where('borrow_id', $borrow->id)
            ->whereHas('details', function ($query) use ($bookCopyId) {
                $query->where('book_copy_id', $bookCopyId);
            })
            ->first();

        if ($lostBook) {
            $this->delete($lostBook);
        }
    }

    public function canReportLost(Borrow $borrow, int $bookCopyId): array
    {
        if ($borrow->status !== 'open') {
            return [false, 'Peminjaman ini tidak dalam status open'];
        }

        $borrowDetail = $borrow->details()->where('book_copy_id', $bookCopyId)->first();

        if (!$borrowDetail) {
            return [false, 'Buku ini tidak termasuk dalam peminjaman'];
        }

        $existingLostBook = LostBook::where('borrow_id', $borrow->id)
            ->whereHas('details', function ($query) use ($bookCopyId) {
                $query->where('book_copy_id', $bookCopyId);
            })
            ->first();

        if ($existingLostBook) {
            return [false, 'Buku ini sudah dilaporkan hilang'];
        }

        return [true, ''];
    }
}
