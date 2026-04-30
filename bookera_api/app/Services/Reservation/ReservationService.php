<?php

namespace App\Services\Reservation;

use App\Helpers\ActivityLogger;
use App\Models\Book;
use App\Models\Borrow;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ReservationService
{
    // ─── Public / User ───────────────────────────────────────────────────────

    /**
     * Create a new reservation for a user on a book.
     * Only allowed if the book is fully out of stock (available_copies == 0).
     */
    public function create(int $bookId, User $user): Reservation
    {
        return DB::transaction(function () use ($bookId, $user) {
            $book = Book::lockForUpdate()->findOrFail($bookId);

            // Cannot reserve if there are still available copies
            if ($book->available_copies > 0) {
                abort(422, 'Buku masih tersedia untuk dipinjam langsung. Reservasi hanya untuk buku yang habis stok.');
            }

            // Check if user already has an active reservation for this book
            $existing = Reservation::where('user_id', $user->id)
                ->where('book_id', $bookId)
                ->whereIn('status', ['waiting', 'notified'])
                ->lockForUpdate()
                ->first();

            if ($existing) {
                abort(422, 'Anda sudah memiliki reservasi aktif untuk buku ini.');
            }

            // Determine queue position
            $lastPosition = Reservation::where('book_id', $bookId)
                ->whereIn('status', ['waiting', 'notified'])
                ->max('queue_position') ?? 0;

            $reservation = Reservation::create([
                'user_id'        => $user->id,
                'book_id'        => $bookId,
                'status'         => 'waiting',
                'queue_position' => $lastPosition + 1,
            ]);

            $reservation->load(['user.profile', 'book']);

            ActivityLogger::log(
                'create',
                'reservation',
                "User {$user->email} reserved book #{$bookId} ({$book->title}), queue #{$reservation->queue_position}",
                [
                    'reservation_id' => $reservation->id,
                    'book_id'        => $bookId,
                    'user'           => $user->email,
                    'queue_position' => $reservation->queue_position,
                ],
                null,
                $reservation
            );

            return $reservation;
        });
    }

    /**
     * Cancel / release a reservation.
     * When user at position #1 (notified) cancels → notify the next in queue.
     */
    public function cancel(Reservation $reservation, User $user): Reservation
    {
        abort_if(
            $reservation->user_id !== $user->id,
            403,
            'Anda tidak berhak membatalkan reservasi ini.'
        );

        abort_if(
            ! in_array($reservation->status, ['waiting', 'notified']),
            422,
            'Hanya reservasi yang aktif yang dapat dibatalkan.'
        );

        $wasNotified = $reservation->status === 'notified';
        $bookId      = $reservation->book_id;

        DB::transaction(function () use ($reservation, $user, $wasNotified, $bookId) {
            $reservation->update(['status' => 'cancelled']);

            // Re-number remaining queue
            $this->reorderQueue($bookId);

            ActivityLogger::log(
                'update',
                'reservation',
                "User {$user->email} cancelled reservation #{$reservation->id} for book #{$bookId}",
                ['reservation_id' => $reservation->id, 'was_notified' => $wasNotified],
                ['status' => $reservation->getOriginal('status')],
                $reservation
            );
        });

        $reservation->load(['user.profile', 'book']);

        // Send cancellation notification
        (new ReservationNotificationService())->notifyReservationCancelled($reservation);

        // If this was the "notified" reservation, alert the next user in queue
        if ($wasNotified) {
            $this->notifyAvailableWaiters($bookId);
        }

        return $reservation;
    }

    /**
     * Get all active reservations for the authenticated user.
     */
    public function getByUser(User $user): Collection
    {
        return Reservation::with(['book.authors', 'book.copies'])
            ->where('user_id', $user->id)
            ->whereIn('status', ['waiting', 'notified'])
            ->orderBy('queue_position')
            ->get();
    }


    /**
     * Get the earliest predicted availability for a book.
     */
    public function getPrediction(int $bookId): array
    {
        // Get active borrows for this book (borrow_details with status 'borrowed')
        $activeBorrows = Borrow::whereHas('borrowDetails.bookCopy', function ($q) use ($bookId) {
                $q->where('book_id', $bookId);
            })
            ->whereHas('borrowDetails', function ($q) {
                $q->where('status', 'borrowed');
            })
            ->where('status', '!=', 'close')
            ->orderBy('return_date', 'asc')
            ->get();

        if ($activeBorrows->isEmpty()) {
            return [
                'earliest_return' => null,
                'suggested_date' => now()->addDay()->toDateString(),
                'message' => 'Buku tidak sedang dipinjam. Salinan tersedia segera.',
            ];
        }

        $earliestReturn = Carbon::parse($activeBorrows->first()->return_date);
        $suggestedDate = $earliestReturn->copy()->addDay();

        return [
            'earliest_return' => $earliestReturn->toDateString(),
            'suggested_date' => $suggestedDate->toDateString(),
            'message' => "Pengembalian tercepat diprediksi pada tanggal " . $earliestReturn->translatedFormat('d F Y') . ". Anda dapat melakukan reservasi mulai tanggal " . $suggestedDate->translatedFormat('d F Y') . ".",
        ];
    }

    /**
     * Check the reservation status for a specific book for the current user.
     * Returns null if no active reservation found.
     */
    public function checkForUser(int $bookId, User $user): ?Reservation
    {
        return Reservation::where('user_id', $user->id)
            ->where('book_id', $bookId)
            ->whereIn('status', ['waiting', 'notified'])
            ->first();
    }

    // ─── Admin ───────────────────────────────────────────────────────────────

    public function getAll(array $filters): LengthAwarePaginator
    {
        $query = Reservation::with(['user.profile', 'book'])
            ->orderBy('book_id')
            ->orderBy('queue_position');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($uq) use ($search) {
                    $uq->where('email', 'like', "%{$search}%")
                        ->orWhereHas('profile', function ($pq) use ($search) {
                            $pq->where('full_name', 'like', "%{$search}%");
                        });
                })->orWhereHas('book', function ($bq) use ($search) {
                    $bq->where('title', 'like', "%{$search}%");
                });
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['book_id'])) {
            $query->where('book_id', $filters['book_id']);
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }

    // ─── Internal Logic ───────────────────────────────────────────────────────

    /**
     * Called by BookReturnService when a copy is returned in good/damaged condition.
     * Finds the first user in the waiting queue and notifies them.
     */
    public function notifyAvailableWaiters(int $bookId): void
    {
        $book = Book::findOrFail($bookId);
        $available = (int) $book->available_copies()->count();

        if ($available <= 0) {
            return;
        }

        $waiters = Reservation::where('book_id', $bookId)
            ->where('status', 'waiting')
            ->orderBy('queue_position')
            ->limit($available)
            ->get();

        /** @var Reservation $waiter */
        foreach ($waiters as $waiter) {
            $waiter->update([
                'status'      => 'notified',
                'notified_at' => now(),
            ]);

            (new ReservationNotificationService())->notifyReservationReady($waiter);

            ActivityLogger::log(
                'update',
                'reservation',
                "Reservation #{$waiter->id} notified – book #{$bookId} is now available",
                ['reservation_id' => $waiter->id, 'user_id' => $waiter->user_id],
                null,
                $waiter
            );
        }
    }

    /**
     * Mark a reservation as fulfilled (called when the reserved borrow is approved/created).
     */
    public function markFulfilled(int $bookId, int $userId): void
    {
        Reservation::where('book_id', $bookId)
            ->where('user_id', $userId)
            ->where('status', 'notified')
            ->update(['status' => 'fulfilled']);

        $this->reorderQueue($bookId);
    }

    /**
     * Re-number queue_position for all waiting/notified reservations for a book.
     */
    private function reorderQueue(int $bookId): void
    {
        $active = Reservation::where('book_id', $bookId)
            ->whereIn('status', ['waiting', 'notified'])
            ->orderBy('queue_position')
            ->orderBy('id')
            ->get();

        /** @var Reservation $res */
        foreach ($active as $index => $res) {
            $res->update(['queue_position' => $index + 1]);
        }
    }
}
