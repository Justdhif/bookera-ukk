<?php

namespace App\Services\BorrowRequest;

use App\Helpers\ActivityLogger;
use App\Models\BookCopy;
use App\Models\Borrow;
use App\Models\BorrowDetail;
use App\Models\BorrowRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class BorrowRequestService
{
    public function getRequests(?string $search = null): Collection
    {
        $query = BorrowRequest::with([
            'borrowRequestDetails.book',
            'user.profile',
        ]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('request_code', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('email', 'like', "%{$search}%")
                            ->orWhereHas('profile', function ($profileQuery) use ($search) {
                                $profileQuery->where('full_name', 'like', "%{$search}%");
                            });
                    })
                    ->orWhereHas('borrowRequestDetails.book', function ($bookQuery) use ($search) {
                        $bookQuery->where('title', 'like', "%{$search}%");
                    });
            });
        }

        return $query->latest()->get();
    }

    public function createRequest(array $data, User $user): BorrowRequest
    {
        return DB::transaction(function () use ($data, $user) {
            $requestCode = $this->generateRequestCode();

            $request = BorrowRequest::create([
                'user_id'      => $user->id,
                'request_code' => $requestCode,
                'borrow_date'  => $data['borrow_date'],
                'return_date'  => $data['return_date'],
            ]);

            $request->update(['qr_code_path' => $this->generateQrCode($requestCode, $request->id)]);

            foreach ($data['book_ids'] as $bookId) {
                $request->borrowRequestDetails()->create([
                    'book_id' => $bookId,
                ]);
            }

            $request->load([
                'borrowRequestDetails.book',
                'user.profile',
            ]);

            ActivityLogger::log(
                'create',
                'borrow_request',
                "Created borrow request #{$request->id} for user {$user->email}",
                [
                    'request_id'  => $request->id,
                    'user'        => $user->email,
                    'borrow_date' => $request->borrow_date,
                    'return_date' => $request->return_date,
                    'book_ids'    => $data['book_ids'],
                ],
                null,
                $request
            );

            return $request;
        });
    }

    public function getRequestByCode(string $code): BorrowRequest
    {
        return BorrowRequest::with([
            'borrowRequestDetails.book',
            'user.profile',
        ])->where('request_code', $code)->firstOrFail();
    }

    public function getRequestById(BorrowRequest $request): BorrowRequest
    {
        return $request->load([
            'borrowRequestDetails.book',
            'user.profile',
        ]);
    }

    public function getRequestsByUser(User $user): Collection
    {
        return BorrowRequest::with([
            'borrowRequestDetails.book',
        ])
            ->where('user_id', $user->id)
            ->latest()
            ->get();
    }

    /**
     * Assign a borrow from a request (scanned QR).
     * Creates a new Borrow with a fresh borrow_code and QR, then assigns an available
     * book copy for each requested book.
     */
    public function assignBorrowFromRequest(BorrowRequest $borrowRequest, array $copyIds = []): Borrow
    {
        return DB::transaction(function () use ($borrowRequest, $copyIds) {
            $borrowCode = $this->generateBorrowCode();

            $borrow = Borrow::create([
                'user_id'     => $borrowRequest->user_id,
                'borrow_code' => $borrowCode,
                'borrow_date' => $borrowRequest->borrow_date,
                'return_date' => $borrowRequest->return_date,
                'status'      => 'open',
            ]);

            $borrow->update(['qr_code_path' => $this->generateBorrowQrCode($borrowCode, $borrow->id)]);

            $details = $borrowRequest->borrowRequestDetails;

            foreach ($details as $index => $detail) {
                // Use the admin-selected copy if provided, otherwise auto-select the first available
                if (!empty($copyIds) && isset($copyIds[$index])) {
                    $copy = BookCopy::where('id', $copyIds[$index])
                        ->where('book_id', $detail->book_id)
                        ->where('status', 'available')
                        ->lockForUpdate()
                        ->firstOrFail();
                } else {
                    $copy = BookCopy::where('book_id', $detail->book_id)
                        ->where('status', 'available')
                        ->lockForUpdate()
                        ->firstOrFail();
                }

                BorrowDetail::create([
                    'borrow_id'    => $borrow->id,
                    'book_copy_id' => $copy->id,
                    'status'       => 'borrowed',
                ]);

                $copy->update(['status' => 'borrowed']);

                ActivityLogger::log(
                    'update',
                    'book_copy',
                    "Book copy #{$copy->id} ({$copy->book->title}) assigned from request #{$borrowRequest->id}",
                    ['copy_id' => $copy->id, 'new_status' => 'borrowed', 'borrow_id' => $borrow->id],
                    ['copy_id' => $copy->id, 'old_status' => 'available'],
                    $copy
                );
            }

            // Delete the request after it's been fulfilled
            $borrowRequest->delete();

            $borrow->load([
                'borrowDetails.bookCopy.book',
                'user.profile',
            ]);

            ActivityLogger::log(
                'create',
                'borrow',
                "Borrow #{$borrow->id} assigned from request for user {$borrow->user->email}",
                [
                    'borrow_id'  => $borrow->id,
                    'user'       => $borrow->user->email,
                    'borrow_date' => $borrow->borrow_date,
                    'return_date' => $borrow->return_date,
                ],
                null,
                $borrow
            );

            return $borrow;
        });
    }

    public function deleteRequest(BorrowRequest $request): void
    {
        $request->delete();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function generateRequestCode(): string
    {
        do {
            $code = 'REQ-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
        } while (BorrowRequest::where('request_code', $code)->exists());

        return $code;
    }

    private function generateBorrowCode(): string
    {
        do {
            $code = 'BRW-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
        } while (Borrow::where('borrow_code', $code)->exists());

        return $code;
    }

    private function generateQrCode(string $requestCode, int $requestId): string
    {
        Storage::disk('public')->makeDirectory('qr_codes');

        $filename     = 'request_' . $requestId . '_' . $requestCode . '.svg';
        $relativePath = 'qr_codes/' . $filename;
        $absolutePath = storage_path('app/public/' . $relativePath);

        QrCode::format('svg')
            ->size(300)
            ->errorCorrection('H')
            ->generate($requestCode, $absolutePath);

        return $relativePath;
    }

    private function generateBorrowQrCode(string $borrowCode, int $borrowId): string
    {
        Storage::disk('public')->makeDirectory('qr_codes');

        $filename     = 'borrow_' . $borrowId . '_' . $borrowCode . '.svg';
        $relativePath = 'qr_codes/' . $filename;
        $absolutePath = storage_path('app/public/' . $relativePath);

        QrCode::format('svg')
            ->size(300)
            ->errorCorrection('H')
            ->generate($borrowCode, $absolutePath);

        return $relativePath;
    }
}
