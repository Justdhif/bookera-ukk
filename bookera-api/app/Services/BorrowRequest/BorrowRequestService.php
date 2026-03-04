<?php

namespace App\Services\BorrowRequest;

use App\Events\BorrowRequestApproved;
use App\Events\BorrowRequestCancelled;
use App\Events\BorrowRequestCreated;
use App\Events\BorrowRequestRejected;
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
                $q->whereHas('user', function ($userQuery) use ($search) {
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
            $request = BorrowRequest::create([
                'user_id'         => $user->id,
                'borrow_date'     => $data['borrow_date'],
                'return_date'     => $data['return_date'],
                'approval_status' => 'processing',
            ]);

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

            event(new BorrowRequestCreated($request));

            return $request;
        });
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

    public function cancelRequest(BorrowRequest $request, User $user): BorrowRequest
    {
        abort_if(
            $request->approval_status !== 'processing',
            422,
            'Only processing requests can be cancelled'
        );

        $request->update(['approval_status' => 'canceled']);

        $request->load(['user.profile']);

        ActivityLogger::log(
            'update',
            'borrow_request',
            "User {$user->email} cancelled borrow request #{$request->id}",
            ['request_id' => $request->id, 'status' => 'canceled'],
            ['request_id' => $request->id, 'status' => 'processing'],
            $request
        );

        event(new BorrowRequestCancelled($request));

        return $request;
    }

    public function approveRequest(BorrowRequest $borrowRequest): Borrow
    {
        abort_if(
            $borrowRequest->approval_status !== 'processing',
            422,
            'Only processing requests can be approved'
        );

        return DB::transaction(function () use ($borrowRequest) {
            $borrowCode = $this->generateBorrowCode();

            $borrow = Borrow::create([
                'user_id'            => $borrowRequest->user_id,
                'borrow_request_id'  => $borrowRequest->id,
                'borrow_code'        => $borrowCode,
                'borrow_date'        => $borrowRequest->borrow_date,
                'return_date'        => $borrowRequest->return_date,
                'status'             => 'open',
            ]);

            $borrow->update(['qr_code_path' => $this->generateBorrowQrCode($borrowCode, $borrow->id)]);

            $borrowRequest->update(['approval_status' => 'approved']);

            $borrowRequest->load(['borrowRequestDetails.book', 'user.profile']);

            $borrow->load(['borrowDetails.bookCopy.book', 'user.profile']);

            ActivityLogger::log(
                'update',
                'borrow_request',
                "Borrow request #{$borrowRequest->id} approved — borrow #{$borrow->id} created",
                ['request_id' => $borrowRequest->id, 'borrow_id' => $borrow->id, 'status' => 'approved'],
                ['request_id' => $borrowRequest->id, 'status' => 'processing'],
                $borrowRequest
            );

            event(new BorrowRequestApproved($borrowRequest, $borrow));

            return $borrow;
        });
    }

    public function rejectRequest(BorrowRequest $borrowRequest, ?string $rejectReason = null): BorrowRequest
    {
        abort_if(
            $borrowRequest->approval_status !== 'processing',
            422,
            'Only processing requests can be rejected'
        );

        $borrowRequest->update([
            'approval_status' => 'rejected',
            'reject_reason'   => $rejectReason,
        ]);

        $borrowRequest->load(['borrowRequestDetails.book', 'user.profile']);

        ActivityLogger::log(
            'update',
            'borrow_request',
            "Borrow request #{$borrowRequest->id} rejected",
            ['request_id' => $borrowRequest->id, 'status' => 'rejected', 'reason' => $rejectReason],
            ['request_id' => $borrowRequest->id, 'status' => 'processing'],
            $borrowRequest
        );

        event(new BorrowRequestRejected($borrowRequest));

        return $borrowRequest;
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

            // Mark request as approved after borrow is created
            $borrowRequest->update(['approval_status' => 'approved']);

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

            $borrowRequest->load(['borrowRequestDetails.book', 'user.profile']);
            event(new BorrowRequestApproved($borrowRequest, $borrow));

            return $borrow;
        });
    }

    public function deleteRequest(BorrowRequest $request): void
    {
        $request->delete();
    }

    /**
     * Assign book copies to an already-created borrow (from an approved request).
     * Must be called from the borrow detail page after approval.
     */
    public function addCopiesToBorrow(Borrow $borrow, array $copyIds): Borrow
    {
        return DB::transaction(function () use ($borrow, $copyIds) {
            $borrowRequest = BorrowRequest::with('borrowRequestDetails')
                ->findOrFail($borrow->borrow_request_id);

            $details = $borrowRequest->borrowRequestDetails;

            if (empty($copyIds) || count($copyIds) !== $details->count()) {
                abort(422, 'Please provide a copy ID for each requested book');
            }

            foreach ($details as $index => $detail) {
                $copy = BookCopy::where('id', $copyIds[$index])
                    ->where('book_id', $detail->book_id)
                    ->where('status', 'available')
                    ->lockForUpdate()
                    ->firstOrFail();

                BorrowDetail::create([
                    'borrow_id'    => $borrow->id,
                    'book_copy_id' => $copy->id,
                    'status'       => 'borrowed',
                ]);

                $copy->update(['status' => 'borrowed']);

                ActivityLogger::log(
                    'update',
                    'book_copy',
                    "Book copy #{$copy->id} ({$copy->book->title}) assigned to borrow #{$borrow->id}",
                    ['copy_id' => $copy->id, 'new_status' => 'borrowed', 'borrow_id' => $borrow->id],
                    ['copy_id' => $copy->id, 'old_status' => 'available'],
                    $copy
                );
            }

            $borrow->load(['borrowDetails.bookCopy.book', 'user.profile']);

            ActivityLogger::log(
                'update',
                'borrow',
                "Book copies assigned to borrow #{$borrow->id} from request #{$borrowRequest->id}",
                ['borrow_id' => $borrow->id, 'copies_assigned' => count($copyIds)],
                null,
                $borrow
            );

            return $borrow;
        });
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function generateBorrowCode(): string
    {
        do {
            $code = 'BRW-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
        } while (Borrow::where('borrow_code', $code)->exists());

        return $code;
    }

    private function generateBorrowQrCode(string $borrowCode, int $borrowId): string
    {
        Storage::disk('public')->makeDirectory('qr_codes');

        $filename     = 'borrow_' . $borrowId . '_' . $borrowCode . '.png';
        $relativePath = 'qr_codes/' . $filename;
        $absolutePath = storage_path('app/public/' . $relativePath);

        QrCode::format('png')
            ->size(300)
            ->errorCorrection('H')
            ->generate($borrowCode, $absolutePath);

        return $relativePath;
    }
}
