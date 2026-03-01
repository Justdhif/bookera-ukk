<?php

namespace App\Services\Borrow;

use App\Events\BorrowRequested;
use App\Helpers\ActivityLogger;
use App\Models\BookCopy;
use App\Models\Borrow;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class BorrowService
{
    public function getBorrows(?string $search = null): Collection
    {
        $query = Borrow::with([
            'borrowDetails.bookCopy.book',
            'user.profile',
            'bookReturns.details.bookCopy.book',
            'fines.fineType',
            'lostBooks.bookCopy.book',
        ]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('email', 'like', "%{$search}%")
                            ->orWhereHas('profile', function ($profileQuery) use ($search) {
                                $profileQuery->where('full_name', 'like', "%{$search}%");
                            });
                    })
                    ->orWhereHas('borrowDetails.bookCopy.book', function ($bookQuery) use ($search) {
                        $bookQuery->where('title', 'like', "%{$search}%");
                    });
            });
        }

        return $query->latest()->get();
    }

    public function createBorrow(array $data, User $user): Borrow
    {
        return DB::transaction(function () use ($data, $user) {
            $borrowCode = $this->generateBorrowCode();

            $borrow = Borrow::create([
                'user_id'     => $user->id,
                'borrow_code' => $borrowCode,
                'borrow_date' => now(),
                'return_date' => $data['return_date'],
                'status'      => 'open',
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
                    'status'       => 'borrowed',
                ]);

                $borrowedCopies[] = [
                    'copy_id'    => $copy->id,
                    'book_title' => $copy->book->title ?? 'Unknown',
                    'old_status' => $copy->status,
                ];
            }

            $borrow->load([
                'borrowDetails.bookCopy.book',
                'user',
            ]);

            ActivityLogger::log(
                'create',
                'borrow',
                "Created borrow #{$borrow->id} for user {$borrow->user->email} with " . count($borrowedCopies) . " book(s)",
                [
                    'borrow_id'       => $borrow->id,
                    'user'            => $borrow->user->email,
                    'return_date'     => $borrow->return_date,
                    'borrowed_copies' => $borrowedCopies,
                ],
                null,
                $borrow
            );

            event(new BorrowRequested($borrow));

            return $borrow;
        });
    }

    public function createAdminBorrow(array $data, User $admin): Borrow
    {
        return DB::transaction(function () use ($data, $admin) {
            $borrowCode = $this->generateBorrowCode();

            $borrow = Borrow::create([
                'user_id'     => $data['user_id'],
                'borrow_code' => $borrowCode,
                'borrow_date' => $data['borrow_date'] ?? now()->toDateString(),
                'return_date' => $data['return_date'],
                'status'      => 'open',
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
                    'status'       => 'borrowed',
                ]);

                $borrowedCopies[] = [
                    'copy_id'    => $copy->id,
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
                'user.profile',
            ]);

            ActivityLogger::log(
                'create',
                'borrow',
                "Admin created direct borrow #{$borrow->id} for user {$borrow->user->email} with " . count($borrowedCopies) . " book(s)",
                [
                    'borrow_id'       => $borrow->id,
                    'user'            => $borrow->user->email,
                    'return_date'     => $borrow->return_date,
                    'status'          => 'open',
                    'borrowed_copies' => $borrowedCopies,
                    'admin'           => $admin->email,
                ],
                null,
                $borrow
            );

            return $borrow;
        });
    }

    public function getBorrowById(Borrow $borrow): Borrow
    {
        return $borrow->load([
            'borrowDetails.bookCopy.book',
            'user',
        ]);
    }

    public function getBorrowByCode(string $code): Borrow
    {
        return Borrow::with([
            'borrowDetails.bookCopy.book',
            'user.profile',
            'bookReturns.details.bookCopy.book',
            'fines.fineType',
            'lostBooks.bookCopy.book',
        ])->where('borrow_code', $code)->firstOrFail();
    }

    public function updateBorrow(Borrow $borrow, array $data): Borrow
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
                    'status'       => 'borrowed',
                ]);

                $addedCopies[] = [
                    'copy_id'    => $copy->id,
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
                    'borrow_id'       => $borrow->id,
                    'new_return_date' => $borrow->return_date,
                    'added_copies'    => $addedCopies,
                ],
                [
                    'borrow_id'       => $borrow->id,
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

    public function getBorrowsByUser(User $user): Collection
    {
        return Borrow::with([
            'borrowDetails.bookCopy.book',
            'bookReturns.details',
            'fines.fineType',
            'lostBooks.bookCopy.book',
        ])
            ->where('user_id', $user->id)
            ->latest()
            ->get();
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Generate a unique borrow code, e.g. BRW-20260301-A3F9K2.
     */
    private function generateBorrowCode(): string
    {
        do {
            $code = 'BRW-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
        } while (Borrow::where('borrow_code', $code)->exists());

        return $code;
    }

    /**
     * Generate a QR code PNG for the given borrow code, save it to storage,
     * and return the relative storage path (e.g. qr_codes/borrow_1.png).
     */
    private function generateQrCode(string $borrowCode, int $borrowId): string
    {
        // Ensure the directory exists
        Storage::disk('public')->makeDirectory('qr_codes');

        $filename = 'borrow_' . $borrowId . '_' . $borrowCode . '.svg';
        $relativePath = 'qr_codes/' . $filename;
        $absolutePath = storage_path('app/public/' . $relativePath);

        // Generate and save the QR code as an SVG file
        QrCode::format('svg')
            ->size(300)
            ->errorCorrection('H')
            ->generate($borrowCode, $absolutePath);

        return $relativePath;
    }
}
