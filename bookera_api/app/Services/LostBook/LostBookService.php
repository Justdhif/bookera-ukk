<?php

namespace App\Services\LostBook;

use App\Helpers\ActivityLogger;
use App\Models\BookCopy;
use App\Models\Borrow;
use App\Models\FineBorrow;
use App\Models\FineType;
use App\Models\LostBook;
use App\Models\LostBookDetail;
use App\Models\User;
use App\Services\BookReturn\BookReturnNotificationService;
use App\Services\NotificationService as DatabaseNotificationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class LostBookService
{
    public function markBorrowDetailsLost(Borrow $borrow, array $borrowDetailIds): Borrow
    {
        return DB::transaction(function () use ($borrow, $borrowDetailIds) {
            if ($borrow->status !== 'open') {
                throw new \Exception('This borrow is not in open status');
            }

            $uniqueIds = array_values(array_unique($borrowDetailIds));

            $borrowDetails = $borrow->borrowDetails()
                ->with('bookCopy.book')
                ->whereIn('id', $uniqueIds)
                ->get();

            if ($borrowDetails->count() !== count($uniqueIds)) {
                throw new \Exception('There are invalid borrow details');
            }

            foreach ($borrowDetails as $borrowDetail) {
                if ($borrowDetail->status !== 'borrowed') {
                    throw new \Exception('One of the books has already been processed');
                }

                $bookCopy = $borrowDetail->bookCopy;
                $oldStatus = $bookCopy->status;

                $borrowDetail->update(['status' => 'lost']);
                $bookCopy->update(['status' => 'lost']);

                ActivityLogger::log(
                    'update',
                    'borrow_detail',
                    "Borrow detail #{$borrowDetail->id} ({$bookCopy->book->title}) marked as lost",
                    [
                        'borrow_detail_id' => $borrowDetail->id,
                        'book_copy_id' => $bookCopy->id,
                        'borrow_id' => $borrow->id,
                        'new_status' => 'lost',
                    ],
                    [
                        'borrow_detail_id' => $borrowDetail->id,
                        'book_copy_id' => $bookCopy->id,
                        'old_status' => $oldStatus,
                    ],
                    $borrowDetail
                );
            }

            $lostSummary = $borrowDetails->map(fn ($detail) => [
                'copy_id' => $detail->book_copy_id,
                'book_title' => $detail->bookCopy->book->title,
                'cover' => $detail->bookCopy->book->cover_image,
                'author' => $detail->bookCopy->book->author,
            ])->toArray();

            (new BookReturnNotificationService())->notifyReturnProcessed($borrow, ['lost' => $lostSummary]);

            $borrow->loadMissing(['user.profile']);
            $borrowerName = $borrow->user?->profile?->full_name ?? $borrow->user?->email ?? __('Unknown User');
            $bookTitles = collect($lostSummary)->take(2)->pluck('book_title')->implode(', ');
            $moreCount = max(0, count($lostSummary) - 2);
            $moreText = $moreCount > 0 ? __(' and :count more', ['count' => $moreCount]) : '';
            $message = __(':name reported lost books :books (Borrow #:id)', [
                'name' => $borrowerName,
                'books' => $bookTitles.$moreText,
                'id' => $borrow->id,
            ]);

            $admins = User::with('profile')->where('role', 'admin')->get();

            foreach ($admins as $admin) {
                DatabaseNotificationService::send(
                    $admin->id,
                    __('Lost Book Reported'),
                    $message,
                    'lost_book_reported',
                    'borrow',
                    [
                        'borrow_id' => $borrow->id,
                        'user' => [
                            'name' => $borrowerName,
                            'avatar' => $borrow->user?->profile?->avatar,
                        ],
                        'books' => collect($lostSummary)->map(fn ($item) => [
                            'title' => $item['book_title'],
                            'cover' => $item['cover'],
                            'author' => $item['author'],
                        ])->toArray(),
                    ]
                );
            }

            return $borrow->load([
                'borrowDetails.bookCopy.book.authors',
                'borrowDetails.bookCopy.book.publishers',
                'borrowDetails.bookCopy.book.categories',
                'borrowRequest.borrowRequestDetails.book',
                'user.profile',
                'bookReturns.details.bookCopy.book.authors',
                'fines.fineType',
                'lostBooks.details.bookCopy.book.authors',
            ]);
        });
    }

    public function getAll(array $filters): LengthAwarePaginator
    {
        $query = LostBook::with([
            'borrow.user.profile',
            'borrow.fines.fineType',
            'details.bookCopy.book',
        ]);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhere('borrow_id', 'like', "%{$search}%")
                    ->orWhereHas('borrow.user', function ($userQuery) use ($search) {
                        $userQuery->where('email', 'like', "%{$search}%")
                            ->orWhereHas('profile', function ($profileQuery) use ($search) {
                                $profileQuery->where('full_name', 'like', "%{$search}%");
                            });
                    })
                    ->orWhereHas('details.bookCopy.book', function ($bookQuery) use ($search) {
                        $bookQuery->where('title', 'like', "%{$search}%");
                    })
                    ->orWhereHas('details.bookCopy', function ($copyQuery) use ($search) {
                        $copyQuery->where('copy_code', 'like', "%{$search}%");
                    })
                    ->orWhereHas('details', function ($detailQuery) use ($search) {
                        $detailQuery->where('notes', 'like', "%{$search}%");
                    });
            });
        }

        return $query->latest()->orderByDesc('id')->paginate($filters['per_page'] ?? 15);
    }

    public function create(Borrow $borrow, array $data): LostBook
    {
        return $this->createMany($borrow, [$data]);
    }

    public function createMany(Borrow $borrow, array $items): LostBook
    {
        return DB::transaction(function () use ($borrow, $items) {
            $lostBook = LostBook::create([
                'borrow_id' => $borrow->id,
            ]);

            foreach ($items as $item) {
                $bookCopy = BookCopy::where('id', $item['book_copy_id'])
                    ->lockForUpdate()
                    ->firstOrFail();
                $bookCopy->loadMissing('book');

                $oldStatus = $bookCopy->status;
                $lostDate = $item['lost_date'] ?? now()->toDateString();

                $lostBookDetail = $lostBook->details()->create([
                    'book_copy_id' => $bookCopy->id,
                    'lost_date' => $lostDate,
                    'notes' => $item['notes'] ?? null,
                ]);

                $bookCopy->update(['status' => 'lost']);

                $borrowDetail = $borrow->borrowDetails()
                    ->where('book_copy_id', $bookCopy->id)
                    ->first();
                if ($borrowDetail) {
                    $borrowDetail->update(['status' => 'lost']);
                }

                ActivityLogger::log(
                    'update',
                    'book_copy',
                    "Book copy #{$bookCopy->id} ({$bookCopy->book->title}) reported as lost",
                    [
                        'copy_id' => $bookCopy->id,
                        'new_status' => 'lost',
                        'borrow_id' => $borrow->id,
                    ],
                    [
                        'copy_id' => $bookCopy->id,
                        'old_status' => $oldStatus,
                    ],
                    $bookCopy
                );

                ActivityLogger::log(
                    'create',
                    'lost_book_detail',
                    "Lost book detail created for copy #{$bookCopy->id} ({$bookCopy->book->title})",
                    [
                        'lost_book_detail_id' => $lostBookDetail->id,
                        'lost_book_id' => $lostBook->id,
                        'lost_date' => $lostDate,
                        'notes' => $lostBookDetail->notes,
                    ],
                    null,
                    $lostBookDetail
                );

                $this->autoCreateLostFine($borrow, $bookCopy);
            }

            ActivityLogger::log(
                'create',
                'lost_book',
                "Lost book reported for borrow #{$borrow->id}",
                [
                    'lost_book_id' => $lostBook->id,
                    'detail_count' => $lostBook->details()->count(),
                    'borrow_id' => $borrow->id,
                ],
                null,
                $lostBook
            );

            $lostBook->load(['borrow.user.profile', 'details.bookCopy.book', 'borrow.fines.fineType']);

            return $lostBook;
        });
    }

    private function autoCreateLostFine(Borrow $borrow, BookCopy $bookCopy): void
    {
        $lostFineType = FineType::where('type', 'lost')->orderBy('amount')->orderBy('id')->first();

        if (!$lostFineType) {
            return;
        }

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
            'amount' => $bookCopy->book->price,
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

    public function update(LostBook $lostBook, array $data): LostBook
    {
        return DB::transaction(function () use ($lostBook, $data) {
            $detail = $this->getPrimaryDetail($lostBook);

            if (!$detail) {
                throw new \Exception('Lost book detail not found');
            }

            $oldValues = [
                'lost_date' => $detail->lost_date ? (string) $detail->lost_date : null,
                'notes' => $detail->notes,
            ];

            $updateData = [];

            if (array_key_exists('lost_date', $data)) {
                $updateData['lost_date'] = $data['lost_date'];
            }

            if (array_key_exists('notes', $data)) {
                $updateData['notes'] = $data['notes'];
            }

            if (!empty($updateData)) {
                $detail->update($updateData);
            }

            ActivityLogger::log(
                'update',
                'lost_book_detail',
                "Lost book detail #{$detail->id} information updated",
                [
                    'lost_book_detail_id' => $detail->id,
                    'lost_book_id' => $lostBook->id,
                    'book_copy_id' => $detail->book_copy_id,
                    'lost_date' => $detail->lost_date ? (string) $detail->lost_date : null,
                    'notes' => $detail->notes,
                ],
                $oldValues,
                $detail
            );

            return $lostBook->load(['borrow.user.profile', 'details.bookCopy.book']);
        });
    }

    public function delete(LostBook $lostBook): void
    {
        $lostBook->loadMissing(['borrow', 'details.bookCopy.book']);

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

    public function finishLostBookProcess(LostBook $lostBook): LostBook
    {
        $borrow = $lostBook->borrow;

        DB::transaction(function () use ($borrow, $lostBook) {
            // No auto-close here, handled by manual complete button
        });

        return $lostBook->load(['borrow.user.profile', 'details.bookCopy.book']);
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

    public function canFinish(LostBook $lostBook): array
    {
        $borrow = $lostBook->borrow;

        $unpaidFines = $borrow->fines()->where('status', 'unpaid')->count();
        if ($unpaidFines > 0) {
            return [false, 'Tidak dapat menyelesaikan proses buku hilang. Masih ada denda yang belum dibayar.'];
        }

        return [true, ''];
    }

    private function getPrimaryDetail(LostBook $lostBook): ?LostBookDetail
    {
        return $lostBook->details()->with('bookCopy.book')->oldest('id')->first();
    }
}