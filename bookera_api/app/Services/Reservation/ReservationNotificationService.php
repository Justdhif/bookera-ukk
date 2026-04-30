<?php

namespace App\Services\Reservation;

use App\Mail\BorrowNotificationMail;
use App\Models\Reservation;
use App\Services\BaseNotificationService;
use Illuminate\Support\Facades\Mail;

class ReservationNotificationService extends BaseNotificationService
{
    public function notifyReservationCreated(Reservation $reservation): void
    {
        $reservation->loadMissing(['user.profile', 'book']);

        $user  = $reservation->user;
        $book  = $reservation->book;
        $title = $book->title ?? $this->t('Unknown Book');
        $pos   = $reservation->queue_position;

        $notifTitle   = $this->t('Book Reservation Confirmed');
        $notifMessage = $pos === 1
            ? $this->t('Your reservation for ":book" is confirmed. You are #1 in queue — you\'ll be notified when a copy becomes available.', ['book' => $title])
            : $this->t('Your reservation for ":book" is confirmed. Your current queue position is #:pos.', ['book' => $title, 'pos' => $pos]);

        // WhatsApp version
        $waMessage = "📌 *{$notifTitle}*\n\n" .
            $notifMessage . "\n\n" .
            "📖 *{$this->t('Book')}:* {$title}\n" .
            "🔢 *{$this->t('Queue Position')}:* #{$pos}\n\n" .
            "_Bookera Library_";

        $this->dispatchNotification(
            $user,
            $notifTitle,
            $notifMessage,
            'reservation_created',
            'reservation',
            [
                'reservation_id'  => $reservation->id,
                'book_id'         => $reservation->book_id,
                'book_title'      => $title,
                'queue_position'  => $pos,
            ],
            fn () => new BorrowNotificationMail(
                subjectLine: $notifTitle . ' - Bookera',
                title: $notifTitle,
                bodyMessage: $notifMessage,
                details: [
                    $this->t('Book')           => $title,
                    $this->t('Queue Position') => '#' . $pos,
                    $this->t('Status')         => $this->t('Waiting'),
                ],
                books: [$title],
                footerNote: $this->t('We will notify you immediately when a copy of this book becomes available.'),
            ),
            $waMessage
        );
    }

    public function notifyReservationReady(Reservation $reservation): void
    {
        $reservation->loadMissing(['user.profile', 'book']);

        $user  = $reservation->user;
        $book  = $reservation->book;
        $title = $book->title ?? $this->t('Unknown Book');

        $notifTitle   = $this->t('Book Ready for You!');
        $notifMessage = $this->t('Great news! A copy of ":book" is now available exclusively for you. Visit the library to borrow it before it is released to others.', ['book' => $title]);

        // WhatsApp version
        $waMessage = "🎉 *{$notifTitle}*\n\n" .
            $notifMessage . "\n\n" .
            "📖 *{$this->t('Book')}:* {$title}\n\n" .
            "⚠️ *{$this->t('Note')}:* " . $this->t('Please visit the library soon. If you no longer wish to borrow, you can release your reservation so others can access the book.') . "\n\n" .
            "_Bookera Library_";

        $this->dispatchNotification(
            $user,
            $notifTitle,
            $notifMessage,
            'reservation_ready',
            'reservation',
            [
                'reservation_id' => $reservation->id,
                'book_id'        => $reservation->book_id,
                'book_title'     => $title,
            ],
            fn () => new BorrowNotificationMail(
                subjectLine: $notifTitle . ' - Bookera',
                title: $notifTitle,
                bodyMessage: $notifMessage,
                details: [
                    $this->t('Book')   => $title,
                    $this->t('Status') => $this->t('Ready — exclusive for you'),
                ],
                books: [$title],
                footerNote: $this->t('Please visit the library soon. If you no longer wish to borrow, you can release your reservation so others can access the book.'),
            ),
            $waMessage
        );
    }

    public function notifyReservationCancelled(Reservation $reservation): void
    {
        $reservation->loadMissing(['user.profile', 'book']);

        $user  = $reservation->user;
        $book  = $reservation->book;
        $title = $book->title ?? $this->t('Unknown Book');

        $notifTitle   = $this->t('Reservation Cancelled');
        $notifMessage = $this->t('Your reservation for ":book" has been cancelled.', ['book' => $title]);

        // WhatsApp version
        $waMessage = "❌ *{$notifTitle}*\n\n" .
            $notifMessage . "\n\n" .
            "📖 *{$this->t('Book')}:* {$title}\n\n" .
            "_Bookera Library_";

        $this->dispatchNotification(
            $user,
            $notifTitle,
            $notifMessage,
            'reservation_cancelled',
            'reservation',
            [
                'reservation_id' => $reservation->id,
                'book_id'        => $reservation->book_id,
                'book_title'     => $title,
            ],
            null,
            $waMessage
        );
    }
}
