<?php

namespace App\Services\BookReturn;

use App\Helpers\ActivityLogger;
use App\Models\BookCopy;
use App\Models\BookReturn;
use App\Models\BookReturnDetail;
use App\Models\Borrow;
use App\Models\BorrowDetail;
use App\Models\FineBorrow;
use App\Models\FineType;
use App\Models\LostBookDetail;
use App\Services\BookReturn\BookReturnNotificationService;
use App\Services\LostBook\LostBookService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;


class BookReturnService
{
    private LostBookService $lostBookService;

    public function __construct(LostBookService $lostBookService)
    {
        $this->lostBookService = $lostBookService;
    }

    public function getByBorrow(Borrow $borrow): Collection
    {
        return BookReturn::with([
            'details.bookCopy.book.authors',
            'details.bookCopy.book.publishers',
            'details.bookCopy.book.categories',
            'borrow.user.profile',
            'borrow.fines.fineType',
        ])
            ->where('borrow_id', $borrow->id)
            ->latest()
            ->orderByDesc('id')
            ->get();
    }

    public function create(Borrow $borrow, array $data): array
    {
        return DB::transaction(function () use ($borrow, $data) {
            $bookReturn = null;
            $results = [
                'returned' => [],
                'lost' => [],
            ];
            $lostItems = [];

            foreach ($data['items'] as $item) {
                $borrowDetail = BorrowDetail::where('id', $item['borrow_detail_id'])
                    ->where('borrow_id', $borrow->id)
                    ->first();

                if (! $borrowDetail) {
                    continue;
                }

                $bookCopy = $borrowDetail->bookCopy;
                $requestedStatus = $item['status'];
                $alreadyReturned = $this->hasFinalizedReturnForCopy($borrow, $bookCopy->id);
                $alreadyLost = $this->hasFinalizedLostForCopy($borrow, $bookCopy->id);

                if ($requestedStatus === 'returned') {
                    if ($alreadyReturned || $alreadyLost) {
                        continue;
                    }

                    if (! $bookReturn) {
                        $bookReturn = BookReturn::firstOrCreate([
                            'borrow_id'   => $borrow->id,
                            'return_date' => now(),
                        ]);
                    }

                    $condition = $item['condition'] ?? 'good';
                    $selectedFineTypeId = isset($item['fine_type_id']) ? (int) $item['fine_type_id'] : null;
                    $selectedDamagedFineType = $this->resolveFineTypeByType('damaged', $selectedFineTypeId);

                    $bookReturn->details()->create([
                        'book_copy_id' => $bookCopy->id,
                        'condition'    => $condition,
                    ]);

                    $borrowDetail->update(['status' => 'returned']);
                    $bookCopy->update(['status' => 'available']);

                    $results['returned'][] = [
                        'copy_id'    => $bookCopy->id,
                        'book_title' => $bookCopy->book->title,
                        'condition'  => $condition,
                    ];

                    if ($condition === 'damaged') {
                        $this->autoCreateDamagedFine($borrow, $bookCopy, $selectedDamagedFineType);
                    }

                    $this->autoCreateLateFine($borrow, $bookCopy);

                    ActivityLogger::log(
                        'update',
                        'book_return_detail',
                        "Book copy #{$bookCopy->id} ({$bookCopy->book->title}) processed as returned (condition: {$condition})",
                        ['copy_id' => $bookCopy->id, 'condition' => $condition],
                        null,
                        $bookCopy
                    );
                } elseif ($requestedStatus === 'lost') {
                    if ($alreadyLost || $alreadyReturned) {
                        continue;
                    }

                    $lostItems[] = [
                        'book_copy_id' => $bookCopy->id,
                        'lost_date'    => $item['lost_date'] ?? now()->toDateString(),
                        'notes'        => $item['notes'] ?? null,
                    ];

                    $results['lost'][] = [
                        'copy_id'    => $bookCopy->id,
                        'book_title' => $bookCopy->book->title,
                    ];
                }
            }

            if (! empty($lostItems)) {
                $this->lostBookService->createMany($borrow, $lostItems);
            }

            if (! empty($results['returned']) || ! empty($results['lost'])) {
                $borrow->load(['user.profile', 'fines.fineType']);
                (new BookReturnNotificationService())->notifyReturnProcessed($borrow, $results);
            }

            return [
                'book_return' => $bookReturn,
                'summary'     => $results,
            ];
        });
    }

    private function autoCreateDamagedFine(Borrow $borrow, BookCopy $bookCopy, ?FineType $preferredFineType = null): void
    {
        $damagedFineType = $preferredFineType ?? $this->resolveFineTypeByType('damaged');
        if (! $damagedFineType) {
            return;
        }

        $fineNotes = 'Denda buku rusak (' . $damagedFineType->name . '): ' . $bookCopy->book->title . ' (Copy: ' . $bookCopy->copy_code . ')';

        $existingFine = $borrow->fines()
            ->where('fine_type_id', $damagedFineType->id)
            ->where('notes', 'like', '%' . $bookCopy->copy_code . '%')
            ->first();

        if ($existingFine) {
            return;
        }

        $fine = FineBorrow::create([
            'borrow_id'    => $borrow->id,
            'fine_type_id' => $damagedFineType->id,
            'amount'       => $damagedFineType->amount,
            'status'       => 'unpaid',
            'notes'        => $fineNotes,
        ]);

        ActivityLogger::log(
            'create',
            'fine',
            "Fine auto-created for damaged book in borrow #{$borrow->id} ({$damagedFineType->name})",
            ['fine_id' => $fine->id, 'amount' => $fine->amount, 'book_copy_id' => $bookCopy->id],
            null,
            $fine
        );

        $fine->load('fineType', 'borrow.user', 'borrow.borrowDetails.bookCopy.book');
    }

    private function autoCreateLateFine(Borrow $borrow, BookCopy $bookCopy): void
    {
        if (! $borrow->return_date) {
            return;
        }

        $expectedReturnDate = Carbon::parse($borrow->return_date)->startOfDay();
        $actualReturnDate = now()->startOfDay();

        if (! $actualReturnDate->greaterThan($expectedReturnDate)) {
            return;
        }

        $daysLate = (int) $expectedReturnDate->diffInDays($actualReturnDate);

        $lateFineType = $this->resolveFineTypeByType('late');
        if (! $lateFineType || $daysLate <= 0) {
            return;
        }

        $totalAmount = $lateFineType->amount * $daysLate;
        $fineNotes = 'Denda keterlambatan (' . $lateFineType->name . ', ' . $daysLate . ' hari): ' . $bookCopy->book->title . ' (Copy: ' . $bookCopy->copy_code . ')';

        $existingFine = $borrow->fines()
            ->where('fine_type_id', $lateFineType->id)
            ->where('notes', 'like', '%' . $bookCopy->copy_code . '%')
            ->first();

        if ($existingFine) {
            return;
        }

        $fine = FineBorrow::create([
            'borrow_id'    => $borrow->id,
            'fine_type_id' => $lateFineType->id,
            'amount'       => $totalAmount,
            'status'       => 'unpaid',
            'notes'        => $fineNotes,
        ]);

        ActivityLogger::log(
            'create',
            'fine',
            "Fine auto-created for late return in borrow #{$borrow->id} ({$lateFineType->name})",
            ['fine_id' => $fine->id, 'amount' => $fine->amount, 'days_late' => $daysLate, 'book_copy_id' => $bookCopy->id],
            null,
            $fine
        );
    }

    private function resolveFineTypeByType(string $type, ?int $preferredFineTypeId = null): ?FineType
    {
        $query = FineType::where('type', $type)->orderBy('amount')->orderBy('id');

        if ($preferredFineTypeId) {
            $preferredFineType = (clone $query)->whereKey($preferredFineTypeId)->first();

            if ($preferredFineType) {
                return $preferredFineType;
            }
        }

        return $query->first();
    }

    public function getDetail(BookReturn $bookReturn): BookReturn
    {
        return $bookReturn->load([
            'details.bookCopy.book.authors',
            'details.bookCopy.book.publishers',
            'details.bookCopy.book.categories',
            'borrow.user.profile',
            'borrow.fines.fineType',
        ]);
    }

    public function canCreate(Borrow $borrow): bool
    {
        return $borrow->status === 'open';
    }

    private function hasFinalizedReturnForCopy(Borrow $borrow, int $bookCopyId): bool
    {
        return BookReturnDetail::whereHas('bookReturn', function ($query) use ($borrow) {
            $query->where('borrow_id', $borrow->id);
        })->where('book_copy_id', $bookCopyId)->exists();
    }

    private function hasFinalizedLostForCopy(Borrow $borrow, int $bookCopyId): bool
    {
        return LostBookDetail::whereHas('lostBook', function ($query) use ($borrow) {
            $query->where('borrow_id', $borrow->id);
        })->where('book_copy_id', $bookCopyId)->exists();
    }
}
