<?php

namespace App\Services\BookReturn;

use App\Helpers\ActivityLogger;
use App\Models\BookCopy;
use App\Models\BookReturn;
use App\Models\BookReturnDetail;
use App\Models\Borrow;
use App\Models\BorrowDetail;
use App\Models\Fine;
use App\Models\FineType;
use App\Models\LostBookDetail;
use App\Services\BookReturn\BookReturnNotificationService;
use App\Services\LostBook\LostBookService;
use Exception;
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
        return BookReturn::with(['details.bookCopy.book'])
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
                        $this->autoCreateDamagedFine($borrow, $bookCopy);
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

    public function updateConditions(BookReturn $bookReturn, array $conditions): BookReturn
    {
        return DB::transaction(function () use ($bookReturn, $conditions) {
            $borrow = $bookReturn->borrow;

            foreach ($conditions as $detailId => $condition) {
                $detail = $bookReturn->details()->find($detailId);
                if (! $detail) {
                    continue;
                }

                $oldCondition = $detail->condition;
                $detail->update(['condition' => $condition]);

                if ($condition === 'damaged') {
                    $this->autoCreateDamagedFine($borrow, $detail->bookCopy);
                }

                ActivityLogger::log(
                    'update',
                    'book_return_detail',
                    "Return detail #{$detail->id} condition updated to '{$condition}'",
                    ['detail_id' => $detail->id, 'new_condition' => $condition],
                    ['detail_id' => $detail->id, 'old_condition' => $oldCondition],
                    $detail
                );
            }

            return $bookReturn->fresh(['details.bookCopy.book', 'borrow.fines.fineType']);
        });
    }

    private function autoCreateDamagedFine(Borrow $borrow, BookCopy $bookCopy): void
    {
        $damagedFineType = FineType::where('type', 'damaged')->first();
        if (! $damagedFineType) {
            return;
        }

        $fineNotes = 'Denda buku rusak: ' . $bookCopy->book->title . ' (Copy: ' . $bookCopy->copy_code . ')';

        $existingFine = $borrow->fines()
            ->where('notes', $fineNotes)
            ->first();

        if ($existingFine) {
            return;
        }

        $fine = Fine::create([
            'borrow_id'    => $borrow->id,
            'fine_type_id' => $damagedFineType->id,
            'amount'       => $damagedFineType->amount,
            'status'       => 'unpaid',
            'notes'        => $fineNotes,
        ]);

        ActivityLogger::log(
            'create',
            'fine',
            "Fine auto-created for damaged book in borrow #{$borrow->id}",
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

        $daysLate = (int) $actualReturnDate->diffInDays($expectedReturnDate);

        $lateFineType = FineType::where('type', 'late')->first();
        if (! $lateFineType || $daysLate <= 0) {
            return;
        }

        $totalAmount = $lateFineType->amount * $daysLate;
        $fineNotes = 'Denda keterlambatan (' . $daysLate . ' hari): ' . $bookCopy->book->title . ' (Copy: ' . $bookCopy->copy_code . ')';

        $existingFine = $borrow->fines()
            ->where('notes', $fineNotes)
            ->first();

        if ($existingFine) {
            return;
        }

        $fine = Fine::create([
            'borrow_id'    => $borrow->id,
            'fine_type_id' => $lateFineType->id,
            'amount'       => $totalAmount,
            'status'       => 'unpaid',
            'notes'        => $fineNotes,
        ]);

        ActivityLogger::log(
            'create',
            'fine',
            "Fine auto-created for late return in borrow #{$borrow->id}",
            ['fine_id' => $fine->id, 'amount' => $fine->amount, 'days_late' => $daysLate, 'book_copy_id' => $bookCopy->id],
            null,
            $fine
        );
    }


    public function finishFines(BookReturn $bookReturn): array
    {
        $borrow = $bookReturn->borrow;

        $unpaidFines = $borrow->fines()->where('status', 'unpaid')->get();

        if ($unpaidFines->isEmpty()) {
            throw new Exception('There are no unpaid fines for this borrow.');
        }

        DB::transaction(function () use ($unpaidFines, $borrow) {
            foreach ($unpaidFines as $fine) {
                $fine->update([
                    'status'  => 'paid',
                    'paid_at' => now(),
                ]);

                ActivityLogger::log(
                    'update',
                    'fine',
                    "Fine #{$fine->id} marked as paid via return finish-fines",
                    ['fine_id' => $fine->id, 'status' => 'paid', 'paid_at' => $fine->paid_at],
                    ['status' => 'unpaid'],
                    $fine
                );
            }
        });

        return $borrow->fines()->with('fineType')->get()->toArray();
    }

    public function getDetail(BookReturn $bookReturn): BookReturn
    {
        return $bookReturn->load([
            'details.bookCopy.book',
            'borrow.user.profile',
            'borrow.fines.fineType',
            'borrow.borrowDetails.bookCopy.book',
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