<?php

namespace App\Services\BookReturn;

use App\Helpers\ActivityLogger;
use App\Models\BookReturn;
use App\Models\Borrow;
use App\Models\BorrowDetail;
use App\Models\LostBook;
use App\Models\FineBorrow;
use App\Models\FineType;
use App\Services\BookReturn\BookReturnNotificationService;
use App\Services\Reservation\ReservationService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;


class BookReturnService
{
    public function getAll(array $filters, bool $paginate = true): LengthAwarePaginator|Collection
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
                    'bookCopy.book.authors',
                    'bookCopy.book.publishers',
                    'bookCopy.book.categories',
                    'bookCopy.book.genres',
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
                            $nestedQuery->whereHas('bookCopy.book', function ($bookQuery) use ($search) {
                                $bookQuery->where('title', 'like', "%{$search}%");
                            })->orWhereHas('bookCopy', function ($copyQuery) use ($search) {
                                $copyQuery->where('copy_code', 'like', "%{$search}%");
                            });
                        });
                    });
            });
        }

        $query->orderByDesc('id');

        return $paginate
            ? $query->paginate($filters['per_page'] ?? 15)
            : $query->get();
    }

    public function confirmReturn(Borrow $borrow, array $data): array
    {
        abort_if($borrow->status !== 'open', 400, 'This borrow is not in open status');

        return DB::transaction(function () use ($borrow, $data) {
            $bookReturn = null;
            $results = [
                'returned' => [],
                'lost' => [],
            ];

            $damagedFineTypes = FineType::where('type', 'damaged')
                ->orderBy('percentage')
                ->orderBy('id')
                ->get();
            $lateFineType = FineType::where('type', 'late')
                ->orderBy('amount')
                ->orderBy('id')
                ->first();

            foreach ($data['items'] as $item) {
                $borrowDetail = BorrowDetail::with(['bookCopy.book'])
                    ->where('id', $item['borrow_detail_id'])
                    ->where('borrow_id', $borrow->id)
                    ->first();

                if (!$borrowDetail || $borrowDetail->status !== 'borrowed') {
                    continue;
                }

                $bookCopy = $borrowDetail->bookCopy;

                if (!$bookCopy) {
                    continue;
                }

                $requestedStatus = $item['status'];

                if ($requestedStatus === 'returned') {
                    $condition = $item['condition'] ?? 'good';
                    $selectedFineTypeId = isset($item['fine_type_id']) ? (int) $item['fine_type_id'] : null;
                    $selectedDamagedFineType = $selectedFineTypeId
                        ? $damagedFineTypes->firstWhere('id', $selectedFineTypeId)
                        : null;
                    $damagedFineType = $selectedDamagedFineType ?? $damagedFineTypes->first();

                    $createdBookReturn = BookReturn::create([
                        'borrow_id' => $borrow->id,
                        'book_copy_id' => $bookCopy->id,
                        'return_date' => now(),
                        'condition' => $condition,
                    ]);

                    $bookReturn ??= $createdBookReturn;

                    $borrowDetail->update(['status' => 'returned']);
                    $bookCopy->update(['status' => 'available']);

                    // Notify next user in reservation queue only when book is returned in good condition
                    if ($condition === 'good') {
                        app(ReservationService::class)->notifyAvailableWaiters($bookCopy->book_id);
                    }

                    $results['returned'][] = [
                        'copy_id' => $bookCopy->id,
                        'book_title' => $bookCopy->book->title,
                        'condition' => $condition,
                    ];

                    if ($condition === 'damaged' && $damagedFineType) {
                        $percentage = (float) ($damagedFineType->percentage ?? 0);
                        $bookPrice = (float) ($bookCopy->book->price ?? 0);
                        $amount = ($bookPrice * $percentage) / 100;

                        // Apply membership discount
                        $activeMembership = $borrow->user->active_membership;
                        $discountPercentage = 0;
                        if ($activeMembership) {
                            $discount = \App\Models\MembershipDiscount::where('discount_key', 'fine_damaged')
                                ->first();
                            
                            if ($discount && $discount->discount_percentage > 0) {
                                $discountPercentage = (float) $discount->discount_percentage;
                                $amount = $amount * (1 - ($discountPercentage / 100));
                            }
                        }

                        $amount = round($amount, 2);
                        $fineNotes = 'Denda buku rusak (' . $damagedFineType->name . ', ' . $percentage . '%): ' . $bookCopy->book->title . ' (Copy: ' . $bookCopy->copy_code . ')';
                        
                        if ($discountPercentage > 0) {
                            $fineNotes .= ' [Member Discount ' . $discountPercentage . '% applied]';
                        }

                        $existingFine = $borrow->fines()
                            ->where('fine_type_id', $damagedFineType->id)
                            ->where('notes', 'like', '%' . $bookCopy->copy_code . '%')
                            ->first();

                        if (!$existingFine) {
                            $fine = FineBorrow::create([
                                'borrow_id' => $borrow->id,
                                'fine_type_id' => $damagedFineType->id,
                                'amount' => $amount,
                                'status' => 'unpaid',
                                'notes' => $fineNotes,
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
                    }

                    if ($lateFineType && $borrow->return_date) {
                        $expectedReturnDate = Carbon::parse($borrow->return_date)->startOfDay();
                        $actualReturnDate = now()->startOfDay();

                        if ($actualReturnDate->greaterThan($expectedReturnDate)) {
                            $daysLate = (int) $expectedReturnDate->diffInDays($actualReturnDate);

                            if ($daysLate > 0) {
                                $totalAmount = $lateFineType->amount * $daysLate;
                                $fineNotes = 'Denda keterlambatan (' . $lateFineType->name . ', ' . $daysLate . ' hari): ' . $bookCopy->book->title . ' (Copy: ' . $bookCopy->copy_code . ')';

                                $existingFine = $borrow->fines()
                                    ->where('fine_type_id', $lateFineType->id)
                                    ->where('notes', 'like', '%' . $bookCopy->copy_code . '%')
                                    ->first();

                                if (!$existingFine) {
                                    $fine = FineBorrow::create([
                                        'borrow_id' => $borrow->id,
                                        'fine_type_id' => $lateFineType->id,
                                        'amount' => $totalAmount,
                                        'status' => 'unpaid',
                                        'notes' => $fineNotes,
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
                            }
                        }
                    }

                    ActivityLogger::log(
                        'update',
                        'book_return_detail',
                        "Book copy #{$bookCopy->id} ({$bookCopy->book->title}) processed as returned (condition: {$condition})",
                        ['copy_id' => $bookCopy->id, 'condition' => $condition],
                        null,
                        $bookCopy
                    );
                } elseif ($requestedStatus === 'lost') {
                    $lostDate = $item['lost_date'] ?? now()->toDateString();
                    $notes = $item['notes'] ?? null;

                    $lostBook = LostBook::create([
                        'borrow_id' => $borrow->id,
                        'book_copy_id' => $bookCopy->id,
                        'lost_date' => $lostDate,
                        'notes' => $notes,
                    ]);

                    $borrowDetail->update(['status' => 'lost']);
                    $bookCopy->update(['status' => 'lost']);

                    $lostFineType = FineType::where('type', 'lost')
                        ->orderBy('amount')
                        ->orderBy('id')
                        ->first();

                    if ($lostFineType) {
                        $bookPrice = (float) ($bookCopy->book->price ?? 0);
                        $amount = $bookPrice > 0 ? $bookPrice : (float) ($lostFineType->amount ?? 0);

                        // Apply membership discount
                        $activeMembership = $borrow->user->active_membership;
                        if ($activeMembership && $activeMembership->plan) {
                            $discountPercentage = (float) ($activeMembership->plan->lost_fine_discount ?? 0);
                            if ($discountPercentage > 0) {
                                $amount = $amount * (1 - ($discountPercentage / 100));
                            }
                        }

                        $amount = round($amount, 2);
                        $fineNotes = 'Denda buku hilang (' . $lostFineType->name . '): ' . $bookCopy->book->title . ' (Copy: ' . $bookCopy->copy_code . ')';

                        if ($activeMembership && isset($discountPercentage) && $discountPercentage > 0) {
                            $fineNotes .= ' [Member Discount ' . $discountPercentage . '% applied]';
                        }

                        $existingFine = $borrow->fines()
                            ->where('fine_type_id', $lostFineType->id)
                            ->where('notes', 'like', '%' . $bookCopy->copy_code . '%')
                            ->first();

                        if (!$existingFine) {
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
                    }

                    $results['lost'][] = [
                        'copy_id' => $bookCopy->id,
                        'book_title' => $bookCopy->book->title,
                        'lost_date' => $lostDate,
                    ];

                    ActivityLogger::log(
                        'update',
                        'lost_book',
                        "Book copy #{$bookCopy->id} ({$bookCopy->book->title}) processed as lost",
                        ['copy_id' => $bookCopy->id, 'lost_date' => $lostDate],
                        null,
                        $lostBook
                    );
                }
            }

            if (!empty($results['returned']) || !empty($results['lost'])) {
                $borrow->load(['user.profile', 'fines.fineType']);
                (new BookReturnNotificationService())->notifyReturnProcessed($borrow, $results);
            }

            return [
                'book_return' => $bookReturn,
                'summary' => $results,
            ];
        });
    }
}
