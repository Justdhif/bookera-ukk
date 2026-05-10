<?php

namespace App\Services\LostBook;

use App\Helpers\ActivityLogger;
use App\Models\Borrow;
use App\Models\FineBorrow;
use App\Models\FineType;
use App\Models\LostBook;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class LostBookService
{
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
        $applyDateRange = function ($lostBookQuery) use ($filters) {
            if (! empty($filters['start_date'])) {
                $lostBookQuery->whereDate('lost_date', '>=', $filters['start_date']);
            }

            if (! empty($filters['end_date'])) {
                $lostBookQuery->whereDate('lost_date', '<=', $filters['end_date']);
            }
        };

        $query = LostBook::whereNotNull('book_copy_id')->with([
            'borrow.user.profile',
            'borrow.fines.fineType',
            'bookCopy.book.authors',
            'bookCopy.book.publishers',
            'bookCopy.book.categories',
            'bookCopy.book.genres',
        ]);

        $applyDateRange($query);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($lostBookQuery) use ($search) {
                $lostBookQuery->where('id', 'like', "%{$search}%")
                    ->orWhere('borrow_id', 'like', "%{$search}%")
                    ->orWhereHas('borrow.user', function ($userQuery) use ($search) {
                        $userQuery->where('email', 'like', "%{$search}%")
                            ->orWhereHas('profile', function ($profileQuery) use ($search) {
                                $profileQuery->where('full_name', 'like', "%{$search}%");
                            });
                    })
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhereHas('bookCopy.book', function ($bookQuery) use ($search) {
                        $bookQuery->where('title', 'like', "%{$search}%");
                    })
                    ->orWhereHas('bookCopy', function ($copyQuery) use ($search) {
                        $copyQuery->where('copy_code', 'like', "%{$search}%");
                    });
            });
        }

        return $query->latest()->orderByDesc('id');
    }

    public function reportLostBook(Borrow $borrow, array $items): Borrow
    {
        return DB::transaction(function () use ($borrow, $items) {
            abort_if($borrow->status !== 'open', 400, 'This borrow is not in open status');

            $normalizedItems = collect($items)
                ->map(function ($item) {
                    if (is_array($item)) {
                        $borrowDetailId = $item['borrow_detail_id'] ?? $item['id'] ?? null;

                        abort_if(! $borrowDetailId, 400, 'Invalid borrow details');

                        return [
                            'borrow_detail_id' => (int) $borrowDetailId,
                            'lost_date' => $item['lost_date'] ?? now()->toDateString(),
                            'notes' => $item['notes'] ?? null,
                        ];
                    }

                    return [
                        'borrow_detail_id' => (int) $item,
                        'lost_date' => now()->toDateString(),
                        'notes' => null,
                    ];
                })
                ->values();

            $detailIds = array_values(array_unique($normalizedItems->pluck('borrow_detail_id')->all()));
            $details = $borrow->borrowDetails()
                ->with(['bookCopy.book.authors', 'bookCopy.book.publishers', 'bookCopy.book.categories', 'bookCopy.book.genres'])
                ->whereIn('id', $detailIds)
                ->get();

            abort_if($details->count() !== count($detailIds), 400, 'Invalid borrow details');
            $itemsByDetailId = $normalizedItems->keyBy('borrow_detail_id');
            $lostBook = null;

            $details->each(function ($detail) use ($borrow, $itemsByDetailId, &$lostBook) {
                abort_if($detail->status !== 'borrowed', 400, 'Book already processed');

                $copy = $detail->bookCopy;
                abort_if(! $copy, 400, 'Book copy not found');

                $oldStatus = $copy->status;
                $detail->update(['status' => 'lost']);
                $copy->update(['status' => 'lost']);

                $item = $itemsByDetailId->get($detail->id, [
                    'lost_date' => now()->toDateString(),
                    'notes' => null,
                ]);

                $lostBook = LostBook::create([
                    'borrow_id' => $borrow->id,
                    'book_copy_id' => $copy->id,
                    'lost_date' => $item['lost_date'] ?? now()->toDateString(),
                    'notes' => $item['notes'] ?? null,
                ]);

                $lostFineType = FineType::where('type', 'lost')
                    ->orderBy('amount')
                    ->orderBy('id')
                    ->first();

                if ($lostFineType) {
                    $bookPrice = (float) ($copy->book->price ?? 0);
                    $amount = $bookPrice > 0 ? $bookPrice : (float) ($lostFineType->amount ?? 0);

                    $activeMembership = $borrow->user->active_membership;
                    $discountPercentage = 0;
                    if ($activeMembership) {
                        $discount = \App\Models\MembershipDiscount::whereHas('discountKey', function ($query) {
                            $query->where('key', 'fine_lost');
                        })->first();
                        
                        if ($discount && $discount->discount_percentage > 0) {
                            $discountPercentage = (float) $discount->discount_percentage;
                            $amount = $amount * (1 - ($discountPercentage / 100));
                        }
                    }

                    $amount = round($amount, 2);
                    $fineNotes = 'Denda buku hilang (' . $lostFineType->name . '): ' . $copy->book->title . ' (Copy: ' . $copy->copy_code . ')';

                    if ($discountPercentage > 0) {
                        $fineNotes .= ' [Member Discount ' . $discountPercentage . '% applied]';
                    }

                    $existingFine = $borrow->fines()
                        ->where('fine_type_id', $lostFineType->id)
                        ->where('notes', 'like', '%' . $copy->copy_code . '%')
                        ->first();

                    if (! $existingFine) {
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
                            ['fine_id' => $fine->id, 'amount' => $fine->amount, 'book_copy_id' => $copy->id],
                            null,
                            $fine
                        );

                        $fine->load('fineType', 'borrow.user', 'borrow.borrowDetails.bookCopy.book');
                    }
                }

                ActivityLogger::log('update', 'borrow_detail', "Book {$copy->book->title} lost",
                    ['detail_id' => $detail->id, 'copy_id' => $copy->id, 'borrow_id' => $borrow->id, 'new_status' => 'lost'],
                    ['detail_id' => $detail->id, 'copy_id' => $copy->id, 'old_status' => $oldStatus],
                    $detail
                );
            });

            if ($lostBook) {
                ActivityLogger::log(
                    'create',
                    'lost_book',
                    "Lost book reported for borrow #{$borrow->id}",
                    [
                        'borrow_id' => $borrow->id,
                        'lost_book_id' => $lostBook->id,
                        'detail_ids' => $details->pluck('id')->values()->all(),
                    ],
                    null,
                    $lostBook
                );
            }

            return $borrow->load([
                'borrowDetails.bookCopy.book.authors',
                'borrowDetails.bookCopy.book.publishers',
                'borrowDetails.bookCopy.book.categories',
                'borrowDetails.bookCopy.book.genres',
                'borrowRequest.borrowRequestDetails.book',
                'user.profile',
                'bookReturns.bookCopy.book.authors',
                'bookReturns.bookCopy.book.publishers',
                'bookReturns.bookCopy.book.categories',
                'bookReturns.bookCopy.book.genres',
                'lostBooks.bookCopy.book.authors',
                'lostBooks.bookCopy.book.publishers',
                'lostBooks.bookCopy.book.categories',
                'lostBooks.bookCopy.book.genres',
            ]);
        });
    }
}
