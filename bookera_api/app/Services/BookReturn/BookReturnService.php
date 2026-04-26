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
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
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
            'details.bookCopy.book.genres',
            'borrow.user.profile',
            'borrow.fines.fineType',
        ])
            ->where('borrow_id', $borrow->id)
            ->latest()
            ->orderByDesc('id')
            ->get();
    }

    public function getAll(array $filters): LengthAwarePaginator
    {
        return $this->buildAdminQuery($filters)->paginate($filters['per_page'] ?? 15);
    }

    public function getExportData(array $filters): Collection
    {
        return $this->buildAdminQuery($filters)->get();
    }

    private function buildAdminQuery(array $filters)
    {
        $applyReturnDateRange = function ($returnQuery) use ($filters) {
            if (!empty($filters['start_date'])) {
                $returnQuery->whereDate('return_date', '>=', $filters['start_date']);
            }

            if (!empty($filters['end_date'])) {
                $returnQuery->whereDate('return_date', '<=', $filters['end_date']);
            }
        };

        $query = Borrow::query()->with([
            'user.profile',
            'fines.fineType',
            'bookReturns' => function ($bookReturnQuery) use ($applyReturnDateRange) {
                $bookReturnQuery->with([
                    'details.bookCopy.book.authors',
                    'details.bookCopy.book.publishers',
                    'details.bookCopy.book.categories',
                    'details.bookCopy.book.genres',
                ])->orderByDesc('return_date')->orderByDesc('id');

                $applyReturnDateRange($bookReturnQuery);
            },
        ])->whereHas('bookReturns', $applyReturnDateRange);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($borrowQuery) use ($search, $applyReturnDateRange) {
                $borrowQuery->where('borrow_code', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('email', 'like', "%{$search}%")
                            ->orWhereHas('profile', function ($profileQuery) use ($search) {
                                $profileQuery->where('full_name', 'like', "%{$search}%");
                            });
                    })
                    ->orWhereHas('bookReturns', function ($bookReturnQuery) use ($search, $applyReturnDateRange) {
                        $applyReturnDateRange($bookReturnQuery);

                        $bookReturnQuery->where(function ($nestedQuery) use ($search) {
                            $nestedQuery->whereHas('details.bookCopy.book', function ($bookQuery) use ($search) {
                                $bookQuery->where('title', 'like', "%{$search}%");
                            })->orWhereHas('details.bookCopy', function ($copyQuery) use ($search) {
                                $copyQuery->where('copy_code', 'like', "%{$search}%");
                            });
                        });
                    });
            });
        }

        return $query->orderByDesc('id');
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

        $percentage = (float) ($damagedFineType->percentage ?? 0);
        $bookPrice = (float) ($bookCopy->book->price ?? 0);
        $amount = round(($bookPrice * $percentage) / 100, 2);
        $fineNotes = 'Denda buku rusak (' . $damagedFineType->name . ', ' . $percentage . '%): ' . $bookCopy->book->title . ' (Copy: ' . $bookCopy->copy_code . ')';

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
            'amount'       => $amount,
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
        $query = FineType::where('type', $type);

        if ($type === 'damaged') {
            $query->orderBy('percentage')->orderBy('id');
        } else {
            $query->orderBy('amount')->orderBy('id');
        }

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
            'details.bookCopy.book.genres',
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
