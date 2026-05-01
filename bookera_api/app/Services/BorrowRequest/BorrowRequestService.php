<?php

namespace App\Services\BorrowRequest;

use App\Helpers\ActivityLogger;
use App\Models\BookCopy;
use App\Models\Borrow;
use App\Models\BorrowDetail;
use App\Models\BorrowRequest;
use App\Models\BorrowRequestDetail;
use App\Models\User;
use App\Services\Borrow\BorrowNotificationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Carbon\Carbon;

class BorrowRequestService
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
        $query = BorrowRequest::with([
            'borrowRequestDetails.book',
            'borrowRequestDetails.bookCopy',
            'user.profile',
        ]);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
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

        if (!empty($filters['approval_status'])) {
            $query->where('approval_status', $filters['approval_status']);
        }

        return $query->latest()->orderByDesc('id');
    }

    public function create(array $data, User $user): BorrowRequest
    {
        // Check for unpaid fines
        $hasUnpaidFines = Borrow::where('user_id', $user->id)
            ->whereHas('fines', function ($query) {
                $query->where('status', 'unpaid');
            })
            ->exists();

        if ($hasUnpaidFines) {
            abort(422, 'Anda memiliki denda yang belum dibayar. Silakan lunasi denda Anda terlebih dahulu sebelum meminjam kembali.');
        }

        // Check for late active borrows
        $hasLateActiveBorrow = Borrow::where('user_id', $user->id)
            ->where('status', 'open')
            ->whereDate('return_date', '<', now()->toDateString())
            ->exists();

        if ($hasLateActiveBorrow) {
            abort(422, 'Anda memiliki peminjaman yang aktif namun sudah melewati batas waktu pengembalian. Silakan kembalikan buku atau selesaikan peminjaman yang telat tersebut terlebih dahulu sebelum melakukan permintaan peminjaman baru.');
        }

        // Check for pending requests (any undecided items in non-canceled requests)
        if ($user->has_pending_borrow_request) {
            abort(422, 'Anda masih memiliki permintaan peminjaman yang belum sepenuhnya diproses (disetujui atau ditolak). Silakan tunggu hingga semua permintaan sebelumnya selesai diproses.');
        }

        $request = DB::transaction(function () use ($data, $user) {
            // Aggregate quantities per book to prevent bypass if duplicate IDs are sent
            $requestedQuantities = [];
            foreach ($data['items'] as $item) {
                $bookId = $item['id'];
                $requestedQuantities[$bookId] = ($requestedQuantities[$bookId] ?? 0) + $item['quantity'];
            }

            // Validate stock availability first
            foreach ($requestedQuantities as $bookId => $totalQuantity) {
                $book = \App\Models\Book::find($bookId);
                if (!$book) {
                    abort(404, "Buku tidak ditemukan.");
                }

                if ($book->available_copies < $totalQuantity) {
                    abort(422, "Stok buku '{$book->title}' tidak mencukupi. Tersedia: {$book->available_copies}, Diminta: {$totalQuantity}.");
                }
            }

            $borrowDate = Carbon::parse($data['borrow_date']);
            $returnDate = $borrowDate->copy()->addDays(5);

            $request = BorrowRequest::create([
                'user_id'         => $user->id,
                'borrow_date'     => $borrowDate->toDateString(),
                'return_date'     => $returnDate->toDateString(),
                'approval_status' => 'processing',
            ]);

            foreach ($data['items'] as $item) {
                $bookId = $item['id'];
                $quantity = $item['quantity'];

                for ($i = 0; $i < $quantity; $i++) {
                    $request->borrowRequestDetails()->create([
                        'book_id' => $bookId,
                        'approval_status' => 'processing',
                    ]);
                }
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
                    'items'       => $data['items'],
                ],
                null,
                $request
            );
            return $request;
        });

        (new BorrowNotificationService())->notifyBorrowRequestCreated($request);

        return $request;
    }

    public function getById(BorrowRequest $request): BorrowRequest
    {
        return $request->load([
            'borrowRequestDetails.book',
            'borrowRequestDetails.bookCopy',
            'user.profile',
            'borrow.borrowDetails.bookCopy.book',
        ]);
    }

    public function getByUser(User $user): Collection
    {
        return BorrowRequest::with([
            'borrowRequestDetails.book',
            'borrowRequestDetails.bookCopy',
        ])
            ->where('user_id', $user->id)
            ->latest()
            ->get();
    }

    public function cancel(BorrowRequest $request, User $user): BorrowRequest
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

        (new BorrowNotificationService())->notifyBorrowRequestCancelled($request);

        return $request;
    }

    public function approve(BorrowRequest $borrowRequest, int $detailId): BorrowRequest
    {
        return DB::transaction(function () use ($borrowRequest, $detailId) {
            $borrowRequest = BorrowRequest::whereKey($borrowRequest->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_if(
                $borrowRequest->approval_status === 'canceled',
                422,
                'Canceled requests cannot be updated'
            );

            $detail = $borrowRequest->borrowRequestDetails()
                ->whereKey($detailId)
                ->lockForUpdate()
                ->firstOrFail();

            abort_if(
                $detail->approval_status !== 'processing',
                422,
                'Only processing books can be approved'
            );

            // Validasi ketersediaan stok buku (pastikan tidak over-approve)
            $approvedButNotAssignedCount = BorrowRequestDetail::where('book_id', $detail->book_id)
                ->where('approval_status', 'approved')
                ->whereNull('book_copy_id')
                ->count();

            $availableCopiesCount = $detail->book->copies()->where('status', 'available')->count();

            if ($availableCopiesCount <= $approvedButNotAssignedCount) {
                abort(422, "Stok buku '" . $detail->book->title . "' tidak mencukupi untuk disetujui. Total stok tersedia: {$availableCopiesCount}, sedang menunggu penugasan: {$approvedButNotAssignedCount}");
            }

            $oldStatus = $detail->approval_status;

            $detail->update([
                'approval_status' => 'approved',
                'reject_reason' => null,
            ]);

            $borrowRequest->load('borrowRequestDetails.book');
            $borrowRequest = $this->syncBorrowRequestStatus($borrowRequest);

            $borrowRequest->load(['borrowRequestDetails.book', 'borrowRequestDetails.bookCopy', 'user.profile']);

            ActivityLogger::log(
                'update',
                'borrow_request_detail',
                "Borrow request detail #{$detail->id} approved",
                [
                    'request_id' => $borrowRequest->id,
                    'detail_id' => $detail->id,
                    'book_id' => $detail->book_id,
                    'status' => 'approved',
                ],
                [
                    'detail_id' => $detail->id,
                    'book_id' => $detail->book_id,
                    'old_status' => $oldStatus,
                ],
                $detail
            );

            return $borrowRequest;
        });
    }

    public function reject(BorrowRequest $borrowRequest, int $detailId, ?string $rejectReason = null): BorrowRequest
    {
        return DB::transaction(function () use ($borrowRequest, $detailId, $rejectReason) {
            $borrowRequest = BorrowRequest::whereKey($borrowRequest->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_if(
                $borrowRequest->approval_status === 'canceled',
                422,
                'Canceled requests cannot be updated'
            );

            $detail = $borrowRequest->borrowRequestDetails()
                ->whereKey($detailId)
                ->lockForUpdate()
                ->firstOrFail();

            abort_if(
                $detail->approval_status !== 'processing',
                422,
                'Only processing books can be rejected'
            );

            $oldStatus = $detail->approval_status;

            $detail->update([
                'approval_status' => 'rejected',
                'reject_reason' => $rejectReason,
            ]);

            $borrowRequest->load('borrowRequestDetails.book');
            $borrowRequest = $this->syncBorrowRequestStatus($borrowRequest);

            $borrowRequest->load(['borrowRequestDetails.book', 'borrowRequestDetails.bookCopy', 'user.profile']);

            ActivityLogger::log(
                'update',
                'borrow_request_detail',
                "Borrow request detail #{$detail->id} rejected",
                [
                    'request_id' => $borrowRequest->id,
                    'detail_id' => $detail->id,
                    'book_id' => $detail->book_id,
                    'status' => 'rejected',
                    'reason' => $rejectReason,
                ],
                [
                    'detail_id' => $detail->id,
                    'book_id' => $detail->book_id,
                    'old_status' => $oldStatus,
                ],
                $detail
            );

            if ($borrowRequest->approval_status === 'rejected') {
                (new BorrowNotificationService())->notifyBorrowRequestRejected($borrowRequest);
            }

            return $borrowRequest;
        });
    }

    /**
     * Assign a borrow from a request (scanned QR).
     * Creates a new Borrow with a fresh borrow_code and QR, then assigns an available
     * book copy for each requested book.
     */
    public function assignBorrow(BorrowRequest $borrowRequest, array $copyIds = []): Borrow
    {
        $notifyBorrowApproval = false;

        $borrow = DB::transaction(function () use ($borrowRequest, $copyIds, &$notifyBorrowApproval) {
            $borrowRequest = BorrowRequest::whereKey($borrowRequest->id)
                ->lockForUpdate()
                ->firstOrFail();

            $pendingDetails = $borrowRequest->borrowRequestDetails()
                ->where('approval_status', 'approved')
                ->whereNull('book_copy_id')
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            $borrow = Borrow::where('borrow_request_id', $borrowRequest->id)
                ->lockForUpdate()
                ->first();

            if ($pendingDetails->isEmpty()) {
                abort_if(! $borrow, 422, 'No approved books are waiting for copy assignment');

                $borrow->load(['borrowDetails.bookCopy.book', 'user.profile']);

                return $borrow;
            }

            if (empty($copyIds) || count($copyIds) !== $pendingDetails->count()) {
                abort(422, 'Sila berikan ID salinan buku untuk setiap buku yang telah disetujui');
            }

            if (! $borrow) {
                $borrowCode = $this->generateBorrowCode();

                $borrow = Borrow::create([
                    'user_id'           => $borrowRequest->user_id,
                    'borrow_request_id' => $borrowRequest->id,
                    'borrow_code'       => $borrowCode,
                    'borrow_date'       => $borrowRequest->borrow_date,
                    'return_date'       => $borrowRequest->return_date,
                    'status'            => 'open',
                ]);

                $borrow->update(['qr_code_path' => $this->generateBorrowQrCode($borrowCode, $borrow->id)]);
                $notifyBorrowApproval = true;
            } elseif ($borrow->status !== 'open') {
                abort(422, 'Borrow is already closed');
            }

            foreach ($pendingDetails as $index => $detail) {
                // Support both indexed array and associative array (detail_id => copy_id)
                $copyId = isset($copyIds[$detail->id]) ? $copyIds[$detail->id] : ($copyIds[$index] ?? null);

                if (! $copyId) {
                    abort(422, "ID salinan buku untuk detail #{$detail->id} tidak ditemukan.");
                }

                $copy = BookCopy::where('id', $copyId)
                    ->where('book_id', $detail->book_id)
                    ->where('status', 'available')
                    ->lockForUpdate()
                    ->first();

                if (! $copy) {
                    $exists = BookCopy::find($copyId);
                    if (! $exists) {
                        abort(404, "Salinan buku dengan ID {$copyId} tidak ditemukan.");
                    }
                    if ($exists->book_id !== $detail->book_id) {
                        abort(422, "Salinan buku '{$exists->copy_code}' bukan milik buku '{$detail->book->title}'.");
                    }
                    if ($exists->status !== 'available') {
                        abort(422, "Salinan buku '{$exists->copy_code}' sudah tidak tersedia (status: {$exists->status}). Silakan pilih salinan lain.");
                    }
                    abort(422, "Gagal menetapkan salinan buku '{$exists->copy_code}'.");
                }

                $detail->update([
                    'book_copy_id' => $copy->id,
                ]);

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
                    [
                        'request_id' => $borrowRequest->id,
                        'detail_id' => $detail->id,
                        'copy_id' => $copy->id,
                        'borrow_id' => $borrow->id,
                        'new_status' => 'borrowed',
                    ],
                    [
                        'detail_id' => $detail->id,
                        'copy_id' => $copy->id,
                        'old_status' => 'available',
                    ],
                    $copy
                );
            }

            $borrowRequest->load('borrowRequestDetails.book');
            $borrowRequest = $this->syncBorrowRequestStatus($borrowRequest);

            $borrow->load(['borrowDetails.bookCopy.book', 'user.profile']);
            $borrowRequest->load(['borrowRequestDetails.book', 'borrowRequestDetails.bookCopy', 'user.profile']);

            ActivityLogger::log(
                'update',
                'borrow_request',
                "Borrow request #{$borrowRequest->id} assigned approved book copies",
                [
                    'request_id' => $borrowRequest->id,
                    'borrow_id' => $borrow->id,
                    'copies_assigned' => count($copyIds),
                    'status' => $borrowRequest->approval_status,
                ],
                null,
                $borrowRequest
            );

            return $borrow;
        });

        $borrowRequest->load(['borrowRequestDetails.book', 'borrowRequestDetails.bookCopy', 'user.profile']);

        if ($notifyBorrowApproval) {
            (new BorrowNotificationService())->notifyBorrowRequestApproved($borrowRequest, $borrow);
        }

        return $borrow;
    }

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
                $copyId = isset($copyIds[$detail->id]) ? $copyIds[$detail->id] : ($copyIds[$index] ?? null);

                if (! $copyId) {
                    abort(422, "ID salinan buku untuk detail #{$detail->id} tidak ditemukan.");
                }

                $copy = BookCopy::where('id', $copyId)
                    ->where('book_id', $detail->book_id)
                    ->where('status', 'available')
                    ->lockForUpdate()
                    ->first();

                if (! $copy) {
                    $exists = BookCopy::find($copyId);
                    if (! $exists) {
                        abort(404, "Salinan buku dengan ID {$copyId} tidak ditemukan.");
                    }
                    if ($exists->book_id !== $detail->book_id) {
                        abort(422, "Salinan buku '{$exists->copy_code}' bukan milik buku '{$detail->book->title}'.");
                    }
                    if ($exists->status !== 'available') {
                        abort(422, "Salinan buku '{$exists->copy_code}' sudah tidak tersedia (status: {$exists->status}). Silakan pilih salinan lain.");
                    }
                    abort(422, "Gagal menetapkan salinan buku '{$exists->copy_code}'.");
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

    private function syncBorrowRequestStatus(BorrowRequest $borrowRequest): BorrowRequest
    {
        $borrowRequest->loadMissing(['borrowRequestDetails.book']);

        $details = $borrowRequest->borrowRequestDetails;

        if ($borrowRequest->approval_status === 'canceled' || $details->isEmpty()) {
            return $borrowRequest;
        }

        if ($details->contains(fn ($detail) => $detail->approval_status === 'approved')) {
            $borrowRequest->update([
                'approval_status' => 'approved',
                'reject_reason' => null,
            ]);
        } elseif ($details->every(fn ($detail) => $detail->approval_status === 'rejected')) {
            $rejectReason = $details
                ->filter(fn ($detail) => ! empty($detail->reject_reason))
                ->map(function ($detail) {
                    $bookTitle = $detail->book?->title;

                    return $bookTitle
                        ? $bookTitle.' - '.$detail->reject_reason
                        : $detail->reject_reason;
                })
                ->implode("\n");

            $borrowRequest->update([
                'approval_status' => 'rejected',
                'reject_reason' => $rejectReason ?: null,
            ]);
        } else {
            $borrowRequest->update([
                'approval_status' => 'processing',
                'reject_reason' => null,
            ]);
        }

        return $borrowRequest->refresh();
    }


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
