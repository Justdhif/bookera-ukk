<?php

namespace App\Services\Borrow;

use App\Mail\BorrowNotificationMail;
use App\Mail\BorrowRequestApprovedMail;
use App\Mail\BorrowRequestRejectedMail;
use App\Models\BookReturn;
use App\Models\Borrow;
use App\Models\BorrowRequest;
use App\Models\Fine;
use App\Models\LostBook;
use App\Models\User;
use App\Services\FonnteService;
use App\Services\NotificationService as DatabaseNotificationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Services\BaseNotificationService;
use Throwable;

class BorrowNotificationService extends BaseNotificationService
{
    public function notifyBorrowRequested(Borrow $borrow): void
    {
        $borrow->loadMissing(['user.profile', 'borrowDetails.bookCopy.book']);

        [$bookTitles, $moreText, $books] = $this->summarizeBooks(
            $borrow->borrowDetails,
            fn ($detail) => $detail->bookCopy->book->title ?? 'Unknown'
        );

        $userName = $borrow->user?->profile?->full_name ?? $borrow->user?->email ?? 'User';
        $message = "{$userName} has a new borrow {$bookTitles}{$moreText} (Borrow #{$borrow->id})";
        $details = [
            'Borrow ID' => '#'.$borrow->id,
            'Borrow Code' => $borrow->borrow_code,
            'Borrower' => $userName,
            'Borrow Date' => Carbon::parse($borrow->borrow_date)->format('d M Y'),
            'Return Date' => Carbon::parse($borrow->return_date)->format('d M Y'),
        ];

        $admins = User::with('profile')->where('role', 'admin')->get();

        foreach ($admins as $admin) {
            $this->dispatchNotification(
                $admin,
                'New Direct Borrow',
                $message,
                'borrow_request',
                'borrow',
                [
                    'borrow_id' => $borrow->id,
                    'user' => [
                        'name' => $userName,
                        'avatar' => $borrow->user?->profile?->avatar,
                    ],
                    'books' => $borrow->borrowDetails->map(fn($d) => [
                        'title' => $d->bookCopy?->book?->title,
                        'cover' => $d->bookCopy?->book?->cover_image,
                        'author' => $d->bookCopy?->book?->author
                    ])->toArray()
                ],
                fn () => new BorrowNotificationMail(
                    subjectLine: 'New Direct Borrow - Bookera',
                    title: 'New Direct Borrow',
                    bodyMessage: $message,
                    details: $details,
                    books: $books,
                    footerNote: 'This borrow was created directly in the system.',
                ),
                "New borrow received from {$userName}. Borrow #{$borrow->id}. Books: {$bookTitles}{$moreText}",
                true,
                false
            );
        }
    }

    public function notifyBorrowIssued(Borrow $borrow): void
    {
        $borrow->loadMissing(['user.profile', 'borrowDetails.bookCopy.book']);

        [$bookTitles, $moreText, $books] = $this->summarizeBooks(
            $borrow->borrowDetails,
            fn ($detail) => $detail->bookCopy->book->title ?? 'Unknown'
        );

        $user = $borrow->user;
        $profile = $user?->profile;
        $userName = $profile?->full_name ?? $user?->email ?? 'User';

        $message = "Peminjaman Anda untuk {$bookTitles}{$moreText} telah berhasil dibuat. Kode pinjam: {$borrow->borrow_code}.";
        $details = [
            'Borrow ID' => '#'.$borrow->id,
            'Borrow Code' => $borrow->borrow_code,
            'Borrow Date' => Carbon::parse($borrow->borrow_date)->format('d M Y'),
            'Return Date' => Carbon::parse($borrow->return_date)->format('d M Y'),
            'Status' => ucfirst($borrow->status),
        ];

        DatabaseNotificationService::send(
            $user->id,
            'Peminjaman Baru',
            $message,
            'borrow_created',
            'borrow',
            [
                'borrow_id' => $borrow->id, 
                'borrow_code' => $borrow->borrow_code,
                'books' => $borrow->borrowDetails->map(fn($d) => [
                    'title' => $d->bookCopy?->book?->title,
                    'cover' => $d->bookCopy?->book?->cover_image,
                    'author' => $d->bookCopy?->book?->author
                ])->toArray()
            ]
        );

        if (! $profile || ! $profile->notification_enabled) {
            return;
        }

        if ($profile->notification_email && ! empty($user->email)) {
            $this->runAfterResponse(
                function () use ($user, $message, $details, $books): void {
                    Mail::to($user->email)->send(new BorrowNotificationMail(
                        subjectLine: 'Borrow Created - Bookera',
                        title: 'Peminjaman Baru',
                        bodyMessage: $message,
                        details: $details,
                        books: $books,
                        footerNote: 'Simpan kode pinjam untuk proses peminjaman di perpustakaan.',
                    ));
                },
                'Failed to send borrow issued email',
                ['recipient_id' => $user->id, 'borrow_id' => $borrow->id]
            );
        }

        if ($profile->notification_whatsapp && $profile->phone_number) {
            $bookList = $borrow->borrowDetails
                ->map(function ($detail) {
                    return '  • '.($detail->bookCopy->book->title ?? 'Unknown');
                })
                ->take(2)
                ->implode("\n").($moreText ? "\n  {$moreText}" : '');

            $whatsappMessage = "📚 *BOOKERA — Peminjaman Baru*\n"
                ."━━━━━━━━━━━━━━━━━━━━\n\n"
                ."Halo, *{$userName}*! 👋\n\n"
                ."Peminjaman buku Anda telah berhasil dibuat.\n\n"
                ."📋 *Detail Peminjaman:*\n"
                .'  🔖 Kode Pinjam  : *'.$borrow->borrow_code."*\n"
                .'  📅 Tanggal Pinjam : '.Carbon::parse($borrow->borrow_date)->format('d M Y')."\n"
                .'  🔄 Batas Kembali : '.Carbon::parse($borrow->return_date)->format('d M Y')."\n\n"
                ."📚 *Buku yang Dipinjam:*\n"
                .$bookList."\n\n"
                ."━━━━━━━━━━━━━━━━━━━━\n"
                ."Simpan kode pinjam ini untuk proses peminjaman di perpustakaan.\n\n"
                .'_Bookera — Perpustakaan Digital_';

            try {
                (new FonnteService)->send($profile->phone_number, $whatsappMessage);
            } catch (Throwable $exception) {
                Log::error('Failed to send borrow issued WhatsApp: '.$exception->getMessage());
            }
        }
    }

    public function notifyBorrowRequestCreated(BorrowRequest $borrowRequest): void
    {
        $borrowRequest->loadMissing(['user.profile', 'borrowRequestDetails.book']);

        [$bookTitles, $moreText, $books] = $this->summarizeBooks(
            $borrowRequest->borrowRequestDetails,
            fn ($detail) => $detail->book->title ?? 'Unknown'
        );

        $userName = $borrowRequest->user?->profile?->full_name ?? $borrowRequest->user?->email ?? 'User';
        $message = "{$userName} wants to borrow {$bookTitles}{$moreText} (Request #{$borrowRequest->id})";
        $details = [
            'Request ID' => '#'.$borrowRequest->id,
            'Borrower' => $userName,
            'Borrow Date' => Carbon::parse($borrowRequest->borrow_date)->format('d M Y'),
            'Return Date' => Carbon::parse($borrowRequest->return_date)->format('d M Y'),
            'Status' => 'Processing',
        ];

        $admins = User::with('profile')->where('role', 'admin')->get();

        foreach ($admins as $admin) {
            $this->dispatchNotification(
                $admin,
                'New Borrow Request',
                $message,
                'borrow_request',
                'borrow',
                [
                    'request_id' => $borrowRequest->id,
                    'user' => [
                        'name' => $userName,
                        'avatar' => $borrowRequest->user?->profile?->avatar,
                    ],
                    'books' => $borrowRequest->borrowRequestDetails->map(fn($d) => [
                        'title' => $d->book?->title,
                        'cover' => $d->book?->cover_image,
                        'author' => $d->book?->author
                    ])->toArray()
                ],
                fn () => new BorrowNotificationMail(
                    subjectLine: 'New Borrow Request - Bookera',
                    title: 'New Borrow Request',
                    bodyMessage: $message,
                    details: $details,
                    books: $books,
                    footerNote: 'Review the request from the admin dashboard.',
                ),
                "Borrow request from {$userName}: {$bookTitles}{$moreText}",
                true,
                false
            );
        }
    }

    public function notifyBorrowRequestApproved(BorrowRequest $borrowRequest, Borrow $borrow): void
    {
        $borrowRequest->loadMissing(['user.profile', 'borrowRequestDetails.book']);
        $borrow->loadMissing(['borrowDetails.bookCopy.book', 'user.profile']);

        $user = $borrowRequest->user;
        $profile = $user?->profile;

        DatabaseNotificationService::send(
            $borrowRequest->user_id,
            'Borrow Request Approved',
            'Your borrow request #'.$borrowRequest->id.' has been approved. Borrow code: '.$borrow->borrow_code.'. Please come to the library on '.Carbon::parse($borrowRequest->borrow_date)->format('d M Y').'.',
            'borrow_request_approved',
            'borrow',
            [
                'request_id' => $borrowRequest->id, 
                'borrow_code' => $borrow->borrow_code,
                'books' => $borrowRequest->borrowRequestDetails->map(fn($d) => [
                    'title' => $d->book?->title,
                    'cover' => $d->book?->cover_image,
                    'author' => $d->book?->author
                ])->toArray()
            ]
        );

        if (! $profile || ! $profile->notification_enabled) {
            return;
        }

        if ($profile->notification_email && ! empty($user->email)) {
            $this->runAfterResponse(
                function () use ($user, $borrowRequest, $borrow): void {
                    Mail::to($user->email)->send(new BorrowRequestApprovedMail($borrowRequest, $borrow));
                },
                'Failed to send borrow approval email',
                ['recipient_id' => $user->id, 'borrow_request_id' => $borrowRequest->id]
            );
        }

        if ($profile->notification_whatsapp && $profile->phone_number) {
            $bookList = $borrowRequest->borrowRequestDetails->map(function ($detail) {
                return '  • '.($detail->book->title ?? 'Unknown');
            })->implode("\n");

            $message = "🎉 *BOOKERA — Peminjaman Disetujui!*\n"
                ."━━━━━━━━━━━━━━━━━━━━\n\n"
                ."Halo, *{$profile->full_name}*! 👋\n\n"
                ."Permintaan peminjaman Anda telah *disetujui* oleh petugas perpustakaan.\n\n"
                ."📋 *Detail Peminjaman:*\n"
                .'  🔖 No. Request   : #'.$borrowRequest->id."\n"
                .'  🎫 Kode Pinjam   : *'.$borrow->borrow_code."*\n"
                .'  📅 Tanggal Ambil : '.Carbon::parse($borrowRequest->borrow_date)->format('d M Y')."\n"
                .'  🔄 Batas Kembali : '.Carbon::parse($borrowRequest->return_date)->format('d M Y')."\n\n"
                ."📚 *Buku yang Dipinjam:*\n"
                .$bookList."\n\n"
                ."━━━━━━━━━━━━━━━━━━━━\n"
                ."⚠️ Tunjukkan *kode pinjam* kepada petugas saat mengambil buku.\n\n"
                .'_Bookera — Perpustakaan Digital_';

            try {
                (new FonnteService)->send($profile->phone_number, $message);
            } catch (Throwable $exception) {
                Log::error('Failed to send borrow approval WhatsApp: '.$exception->getMessage());
            }
        }
    }

    public function notifyBorrowRequestRejected(BorrowRequest $borrowRequest): void
    {
        $borrowRequest->loadMissing(['user.profile', 'borrowRequestDetails.book']);

        $user = $borrowRequest->user;
        $profile = $user?->profile;
        $reason = $borrowRequest->reject_reason ? (' Reason: '.$borrowRequest->reject_reason) : '';

        DatabaseNotificationService::send(
            $borrowRequest->user_id,
            'Borrow Request Rejected',
            'Your borrow request #'.$borrowRequest->id.' has been rejected.'.$reason,
            'borrow_request_rejected',
            'borrow',
            [
                'request_id' => $borrowRequest->id, 
                'reject_reason' => $borrowRequest->reject_reason,
                'books' => $borrowRequest->borrowRequestDetails->map(fn($d) => [
                    'title' => $d->book?->title,
                    'cover' => $d->book?->cover_image,
                    'author' => $d->book?->author
                ])->toArray()
            ]
        );

        if (! $profile || ! $profile->notification_enabled) {
            return;
        }

        if ($profile->notification_email && ! empty($user->email)) {
            $this->runAfterResponse(
                function () use ($user, $borrowRequest): void {
                    Mail::to($user->email)->send(new BorrowRequestRejectedMail($borrowRequest));
                },
                'Failed to send borrow rejection email',
                ['recipient_id' => $user->id, 'borrow_request_id' => $borrowRequest->id]
            );
        }

        if ($profile->notification_whatsapp && $profile->phone_number) {
            $bookList = $borrowRequest->borrowRequestDetails->map(function ($detail) {
                return '  • '.($detail->book->title ?? 'Unknown');
            })->implode("\n");

            $reasonText = $borrowRequest->reject_reason
                ? "📝 *Alasan Penolakan:*\n  ".$borrowRequest->reject_reason."\n\n"
                : '';

            $message = "❌ *BOOKERA — Peminjaman Ditolak*\n"
                ."━━━━━━━━━━━━━━━━━━━━\n\n"
                ."Halo, *{$profile->full_name}*! 👋\n\n"
                .'Mohon maaf, permintaan peminjaman *#'.$borrowRequest->id."* tidak dapat diproses.\n\n"
                ."📚 *Buku yang Diminta:*\n"
                .$bookList."\n\n"
                .$reasonText
                ."💡 Anda dapat mengajukan permintaan baru dengan memilih buku yang tersedia.\n\n"
                ."━━━━━━━━━━━━━━━━━━━━\n"
                .'_Bookera — Perpustakaan Digital_';

            try {
                (new FonnteService)->send($profile->phone_number, $message);
            } catch (Throwable $exception) {
                Log::error('Failed to send borrow rejection WhatsApp: '.$exception->getMessage());
            }
        }
    }

    public function notifyBorrowRequestCancelled(BorrowRequest $borrowRequest): void
    {
        $borrowRequest->loadMissing(['user.profile', 'borrowRequestDetails.book']);

        [$bookTitles, $moreText, $books] = $this->summarizeBooks(
            $borrowRequest->borrowRequestDetails,
            fn ($detail) => $detail->book->title ?? 'Unknown'
        );

        $userName = $borrowRequest->user?->profile?->full_name ?? $borrowRequest->user?->email ?? 'User';
        $message = "{$userName} cancelled borrow request #{$borrowRequest->id}";
        $details = [
            'Request ID' => '#'.$borrowRequest->id,
            'Borrower' => $userName,
            'Status' => 'Cancelled',
            'Books' => $bookTitles.$moreText,
        ];

        $admins = User::with('profile')->where('role', 'admin')->get();

        foreach ($admins as $admin) {
            $this->dispatchNotification(
                $admin,
                'Borrow Request Cancelled',
                $message,
                'borrow_request_cancelled',
                'borrow',
                [
                    'request_id' => $borrowRequest->id,
                    'user' => [
                        'name' => $userName,
                        'avatar' => $borrowRequest->user?->profile?->avatar,
                    ],
                    'books' => $borrowRequest->borrowRequestDetails->map(fn($d) => [
                        'title' => $d->book?->title,
                        'cover' => $d->book?->cover_image,
                        'author' => $d->book?->author
                    ])->toArray()
                ],
                fn () => new BorrowNotificationMail(
                    subjectLine: 'Borrow Request Cancelled - Bookera',
                    title: 'Borrow Request Cancelled',
                    bodyMessage: $message,
                    details: $details,
                    books: $books,
                    footerNote: 'The request was cancelled by the user.',
                ),
                "{$userName} cancelled borrow request #{$borrowRequest->id}. Books: {$bookTitles}{$moreText}",
                true,
                false
            );
        }
    }
}
