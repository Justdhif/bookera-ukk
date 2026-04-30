<?php

namespace App\Services\Borrow;

use App\Services\Borrow\BorrowNotificationService;
use App\Helpers\ActivityLogger;
use App\Models\BookCopy;
use App\Models\Borrow;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Carbon\Carbon;

class BorrowService
{
    public function getAll(array $filters): LengthAwarePaginator
    {
        return $this->buildAdminQuery($filters)->paginate($filters['per_page'] ?? 15);
    }

    public function getExportData(array $filters): Collection
    {
        return $this->buildAdminQuery($filters)->get();
    }

    public function create(array $data, User $user): Borrow
    {
        $hasUnpaidFines = Borrow::where('user_id', $user->id)
            ->whereHas('fines', function ($query) {
                $query->where('status', 'unpaid');
            })
            ->exists();

        if ($hasUnpaidFines) {
            abort(422, __('The user has unpaid fines. Please settle the fines before borrowing again.'));
        }

        $borrow = DB::transaction(function () use ($data, $user) {
            $borrowCode = $this->generateBorrowCode();
            $borrowDate = now();
            $returnDate = $borrowDate->copy()->addDays(5);

            $borrow = Borrow::create([
                'user_id' => $user->id,
                'borrow_code' => $borrowCode,
                'borrow_date' => $borrowDate->toDateString(),
                'return_date' => $returnDate->toDateString(),
                'status' => 'open',
            ]);

            $borrow->update(['qr_code_path' => $this->generateQrCode($borrowCode, $borrow->id)]);

            $borrowedCopies = [];

            foreach ($data['book_copy_ids'] as $copyId) {
                $copy = BookCopy::with('book')->where('id', $copyId)
                    ->where('status', 'available')
                    ->lockForUpdate()
                    ->firstOrFail();

                // Check if user is allowed to take this "available" copy based on notified reservations
                if ($copy->book->available_copies <= 0) {
                    abort(422, __('This book is currently reserved for other users.'));
                }

                $borrow->borrowDetails()->create([
                    'book_copy_id' => $copy->id,
                    'status' => 'borrowed',
                ]);

                $borrowedCopies[] = [
                    'copy_id' => $copy->id,
                    'book_title' => $copy->book->title ?? 'Unknown',
                    'old_status' => $copy->status,
                ];
            }

            $borrow->load([
                'borrowDetails.bookCopy.book',
                'borrowDetails.bookCopy.book.genres',
                'user',
            ]);

            ActivityLogger::log(
                'create',
                'borrow',
                "Created borrow #{$borrow->id} for user {$borrow->user->email} with " . count($borrowedCopies) . " book(s)",
                [
                    'borrow_id' => $borrow->id,
                    'user' => $borrow->user->email,
                    'return_date' => $borrow->return_date,
                    'borrowed_copies' => $borrowedCopies,
                ],
                null,
                $borrow
            );

            return $borrow;
        });

        (new BorrowNotificationService())->notifyBorrowRequested($borrow);

        return $borrow;
    }

    public function createAdmin(array $data, User $admin): Borrow
    {
        // Check for unpaid fines for the target user
        $hasUnpaidFines = Borrow::where('user_id', $data['user_id'])
            ->whereHas('fines', function ($query) {
                $query->where('status', 'unpaid');
            })
            ->exists();

        if ($hasUnpaidFines) {
            abort(422, __('The user has unpaid fines. Please settle the fines before borrowing again.'));
        }

        $borrow = DB::transaction(function () use ($data, $admin) {
            $borrowCode = $this->generateBorrowCode();
            $borrowDate = isset($data['borrow_date']) ? Carbon::parse($data['borrow_date']) : now();
            $returnDate = $borrowDate->copy()->addDays(5);

            $borrow = Borrow::create([
                'user_id' => $data['user_id'],
                'borrow_code' => $borrowCode,
                'borrow_date' => $borrowDate->toDateString(),
                'return_date' => $returnDate->toDateString(),
                'status' => 'open',
            ]);

            $borrow->update(['qr_code_path' => $this->generateQrCode($borrowCode, $borrow->id)]);

            $borrowedCopies = [];

            foreach ($data['book_copy_ids'] as $copyId) {
                $copy = BookCopy::where('id', $copyId)
                    ->where('status', 'available')
                    ->lockForUpdate()
                    ->firstOrFail();

                $borrow->borrowDetails()->create([
                    'book_copy_id' => $copy->id,
                    'status' => 'borrowed',
                ]);

                $borrowedCopies[] = [
                    'copy_id' => $copy->id,
                    'book_title' => $copy->book->title ?? 'Unknown',
                    'old_status' => $copy->status,
                ];

                $copy->update(['status' => 'borrowed']);

                ActivityLogger::log(
                    'update',
                    'book_copy',
                    "Book copy #{$copy->id} ({$copy->book->title}) status changed to borrowed (admin borrow #{$borrow->id})",
                    ['copy_id' => $copy->id, 'new_status' => 'borrowed', 'borrow_id' => $borrow->id],
                    ['copy_id' => $copy->id, 'old_status' => 'available'],
                    $copy
                );
            }

            $borrow->load([
                'borrowDetails.bookCopy.book',
                'borrowDetails.bookCopy.book.genres',
                'user.profile',
            ]);

            ActivityLogger::log(
                'create',
                'borrow',
                "Admin created direct borrow #{$borrow->id} for user {$borrow->user->email} with " . count($borrowedCopies) . " book(s)",
                [
                    'borrow_id' => $borrow->id,
                    'user' => $borrow->user->email,
                    'return_date' => $borrow->return_date,
                    'status' => 'open',
                    'borrowed_copies' => $borrowedCopies,
                    'admin' => $admin->email,
                ],
                null,
                $borrow
            );

            return $borrow;
        });

        (new BorrowNotificationService())->notifyBorrowIssued($borrow);

        return $borrow;
    }



    public function getByCode(string $code): Borrow
    {
        return Borrow::with([
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
            'fines.fineType',
            'lostBooks.bookCopy.book.authors',
            'lostBooks.bookCopy.book.publishers',
            'lostBooks.bookCopy.book.categories',
            'lostBooks.bookCopy.book.genres',
        ])->where('borrow_code', $code)->firstOrFail();
    }

    private function buildAdminQuery(array $filters)
    {
        $query = Borrow::query()->with([
            'borrowDetails.bookCopy.book.authors',
            'borrowDetails.bookCopy.book.publishers',
            'borrowDetails.bookCopy.book.categories',
            'borrowDetails.bookCopy.book.genres',
            'borrowRequest.borrowRequestDetails.book.authors',
            'user.profile',
            'bookReturns.bookCopy.book.authors',
            'bookReturns.bookCopy.book.publishers',
            'bookReturns.bookCopy.book.categories',
            'bookReturns.bookCopy.book.genres',
            'fines.fineType',
            'lostBooks.bookCopy.book.authors',
            'lostBooks.bookCopy.book.publishers',
            'lostBooks.bookCopy.book.categories',
            'lostBooks.bookCopy.book.genres',
        ]);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where('borrow_code', 'like', "%{$search}%");
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['start_date'])) {
            $query->whereDate('borrow_date', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->whereDate('borrow_date', '<=', $filters['end_date']);
        }

        return $query->orderBy('id', 'desc');
    }

    public function update(Borrow $borrow, array $data): Borrow
    {
        return DB::transaction(function () use ($borrow, $data) {
            $oldReturnDate = $borrow->return_date;

            $borrow->update(['return_date' => $data['return_date']]);

            $addedCopies = [];

            foreach ($data['book_copy_ids'] as $copyId) {
                $copy = BookCopy::where('id', $copyId)
                    ->where('status', 'available')
                    ->lockForUpdate()
                    ->firstOrFail();

                $borrow->borrowDetails()->create([
                    'book_copy_id' => $copy->id,
                    'status' => 'borrowed',
                ]);

                $addedCopies[] = [
                    'copy_id' => $copy->id,
                    'book_title' => $copy->book->title ?? 'Unknown',
                ];

                $copy->update(['status' => 'borrowed']);
            }

            $borrow->load([
                'borrowDetails.bookCopy.book',
                'user',
            ]);

            ActivityLogger::log(
                'update',
                'borrow',
                "Updated borrow #{$borrow->id} - added " . count($addedCopies) . " book(s)",
                [
                    'borrow_id' => $borrow->id,
                    'new_return_date' => $borrow->return_date,
                    'added_copies' => $addedCopies,
                ],
                [
                    'borrow_id' => $borrow->id,
                    'old_return_date' => $oldReturnDate,
                ],
                $borrow
            );

            foreach ($addedCopies as $copyInfo) {
                $copy = BookCopy::find($copyInfo['copy_id']);
                ActivityLogger::log(
                    'update',
                    'book_copy',
                    "Book copy #{$copyInfo['copy_id']} ({$copyInfo['book_title']}) status changed to borrowed (added to borrow #{$borrow->id})",
                    ['copy_id' => $copyInfo['copy_id'], 'new_status' => 'borrowed', 'borrow_id' => $borrow->id],
                    ['copy_id' => $copyInfo['copy_id'], 'old_status' => 'available'],
                    $copy
                );
            }

            return $borrow;
        });
    }

    public function complete(Borrow $borrow): Borrow
    {
        return DB::transaction(function () use ($borrow) {
            $borrow->load([
                'borrowDetails',
                'fines',
                'lostBooks.bookCopy.book',
                'bookReturns.bookCopy.book',
            ]);

            $processedCopyIds = collect($borrow->bookReturns)
                ->pluck('book_copy_id')
                ->merge(collect($borrow->lostBooks)->pluck('book_copy_id'))
                ->filter()
                ->unique();

            $hasUnprocessedBooks = $borrow->borrowDetails->contains(
                fn($detail) => !$processedCopyIds->contains($detail->book_copy_id)
            );

            if ($hasUnprocessedBooks) {
                throw new \Exception(__('There are still books whose return or lost status has not been processed'));
            }

            $hasUnpaidFines = $borrow->fines()->where('status', 'unpaid')->exists();
            if ($hasUnpaidFines) {
                throw new \Exception(__('There are still unpaid fines'));
            }

            // Clean up lost book records if the admin eventually marked them as returned
            foreach ($borrow->borrowDetails as $detail) {
                if ($detail->status === 'returned') {
                    $borrow->lostBooks()->where('book_copy_id', $detail->book_copy_id)->delete();

                    BookCopy::where('id', $detail->book_copy_id)->update(['status' => 'available']);
                }
            }

            $borrow->update(['status' => 'close']);

            ActivityLogger::log(
                'update',
                'borrow',
                "Direct borrow #{$borrow->id} completed/closed",
                ['borrow_id' => $borrow->id, 'new_status' => 'close'],
                ['borrow_id' => $borrow->id, 'old_status' => 'open'],
                $borrow
            );

            return $borrow->fresh([
                'borrowDetails.bookCopy.book.authors',
                'borrowDetails.bookCopy.book.publishers',
                'borrowDetails.bookCopy.book.categories',
                'borrowDetails.bookCopy.book.genres',
                'bookReturns.bookCopy.book.authors',
                'bookReturns.bookCopy.book.publishers',
                'bookReturns.bookCopy.book.categories',
                'bookReturns.bookCopy.book.genres',
                'fines.fineType',
                'lostBooks.bookCopy.book.authors',
                'lostBooks.bookCopy.book.publishers',
                'lostBooks.bookCopy.book.categories',
                'lostBooks.bookCopy.book.genres',
            ]);
        });
    }

    public function getByUser(User $user, array $filters = []): Collection
    {
        $query = Borrow::query()->with([
            'borrowDetails.bookCopy.book.authors',
            'borrowDetails.bookCopy.book.publishers',
            'borrowDetails.bookCopy.book.categories',
            'borrowDetails.bookCopy.book.genres',
            'bookReturns.bookCopy.book.authors',
            'bookReturns.bookCopy.book.publishers',
            'bookReturns.bookCopy.book.categories',
            'bookReturns.bookCopy.book.genres',
            'fines.fineType',
            'lostBooks.bookCopy.book.authors',
            'lostBooks.bookCopy.book.publishers',
            'lostBooks.bookCopy.book.categories',
            'lostBooks.bookCopy.book.genres',
        ])
            ->where('user_id', $user->id);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where('borrow_code', 'like', "%{$search}%");
        }

        if (!empty($filters['start_date'])) {
            $query->whereDate('borrow_date', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->whereDate('borrow_date', '<=', $filters['end_date']);
        }

        return $query->orderBy('id', 'desc')->get();
    }

    private function generateBorrowCode(): string
    {
        do {
            $code = 'BRW-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
        } while (Borrow::where('borrow_code', $code)->exists());

        return $code;
    }

    private function generateQrCode(string $borrowCode, int $borrowId): string
    {
        Storage::disk('public')->makeDirectory('qr_codes');

        $filename = 'borrow_' . $borrowId . '_' . $borrowCode . '.png';
        $relativePath = 'qr_codes/' . $filename;
        $absolutePath = storage_path('app/public/' . $relativePath);

        QrCode::format('png')
            ->size(300)
            ->errorCorrection('H')
            ->generate($borrowCode, $absolutePath);

        return $relativePath;
    }
}
