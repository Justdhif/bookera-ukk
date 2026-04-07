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

class BorrowNotificationService
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
                ['borrow_id' => $borrow->id],
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
            ['borrow_id' => $borrow->id, 'borrow_code' => $borrow->borrow_code]
        );

        if (! $profile || ! $profile->notification_enabled) {
            return;
        }

        if ($profile->notification_email && ! empty($user->email)) {
            $this->sendMailAfterResponse(
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
            } catch (\Throwable $exception) {
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
                ['request_id' => $borrowRequest->id],
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
            ['request_id' => $borrowRequest->id, 'borrow_code' => $borrow->borrow_code]
        );

        if (! $profile || ! $profile->notification_enabled) {
            return;
        }

        if ($profile->notification_email && ! empty($user->email)) {
            $this->sendMailAfterResponse(
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
            } catch (\Throwable $exception) {
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
            ['request_id' => $borrowRequest->id, 'reject_reason' => $borrowRequest->reject_reason]
        );

        if (! $profile || ! $profile->notification_enabled) {
            return;
        }

        if ($profile->notification_email && ! empty($user->email)) {
            $this->sendMailAfterResponse(
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
            } catch (\Throwable $exception) {
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
                ['request_id' => $borrowRequest->id],
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

    public function notifyReturnRequested(BookReturn $bookReturn): void
    {
        $bookReturn->loadMissing(['borrow.user.profile', 'details.bookCopy.book']);

        $borrow = $bookReturn->borrow;
        $user = $borrow?->user;
        $profile = $user?->profile;
        $userName = $profile?->full_name ?? $user?->email ?? 'Unknown User';

        [$bookTitles, $moreText, $books] = $this->summarizeBooks(
            $bookReturn->details,
            fn ($detail) => $detail->bookCopy->book->title ?? 'Unknown'
        );

        $details = [
            'Return ID' => '#'.$bookReturn->id,
            'Borrow ID' => '#'.$borrow->id,
            'Borrow Code' => $borrow->borrow_code,
            'Borrower' => $userName,
            'Return Date' => Carbon::parse($bookReturn->return_date)->format('d M Y'),
        ];

        $admins = User::with('profile')->where('role', 'admin')->get();

        foreach ($admins as $admin) {
            $adminName = $admin?->profile?->full_name ?? $admin?->email ?? 'Admin';

            $whatsappMessage = "📥 *BOOKERA — Pengajuan Pengembalian*\n"
                ."━━━━━━━━━━━━━━━━━━━━\n\n"
                ."Halo, *{$adminName}*! 👋\n\n"
                ."{$userName} mengajukan pengembalian buku.\n\n"
                ."📋 *Detail Pengajuan:*\n"
                .'  🔖 Kode Pinjam : *'.$borrow->borrow_code."*\n"
                .'  👤 Peminjam    : '.$userName."\n"
                .'  📅 Tanggal Ajukan : '.Carbon::parse($bookReturn->return_date)->format('d M Y')."\n\n"
                ."📚 *Buku yang Dikembalikan:*\n"
                .collect($books)->take(2)->map(fn ($book) => '  • '.$book)->implode("\n").($moreText ? "\n  {$moreText}" : '')
                ."\n\n"
                ."━━━━━━━━━━━━━━━━━━━━\n"
                ."Silakan tinjau pengajuan di dashboard Bookera.\n\n"
                .'_Bookera — Perpustakaan Digital_';

            $this->dispatchNotification(
                $admin,
                'Pengajuan Pengembalian Baru',
                "{$userName} mengajukan pengembalian untuk {$bookTitles}{$moreText} (Peminjaman #{$borrow->id}).",
                'return_request',
                'return',
                ['return_id' => $bookReturn->id, 'borrow_id' => $borrow->id],
                fn () => new BorrowNotificationMail(
                    subjectLine: 'Return Request - Bookera',
                    title: 'Pengajuan Pengembalian Baru',
                    bodyMessage: "{$userName} mengajukan pengembalian untuk {$bookTitles}{$moreText} (Peminjaman #{$borrow->id}).",
                    details: $details,
                    books: $books,
                    footerNote: 'Silakan review pengajuan pengembalian ini di dashboard Bookera.',
                ),
                $whatsappMessage,
                true,
                true
            );
        }
    }

    public function notifyReturnApproved(BookReturn $bookReturn): void
    {
        $bookReturn->loadMissing(['borrow.user.profile', 'details.bookCopy.book']);

        $borrow = $bookReturn->borrow;
        $user = $borrow?->user;
        $profile = $user?->profile;
        $userName = $profile?->full_name ?? $user?->email ?? 'Unknown User';

        [$bookTitles, $moreText, $books] = $this->summarizeBooks(
            $bookReturn->details,
            fn ($detail) => $detail->bookCopy->book->title ?? 'Unknown'
        );

        $message = "Pengembalian Anda untuk {$bookTitles}{$moreText} telah berhasil diproses.";
        $details = [
            'Return ID' => '#'.$bookReturn->id,
            'Borrow ID' => '#'.$borrow->id,
            'Borrow Code' => $borrow->borrow_code,
            'Processed At' => Carbon::parse($bookReturn->return_date)->format('d M Y'),
            'Status' => 'Selesai',
        ];

        DatabaseNotificationService::send(
            $borrow->user_id,
            'Pengembalian Diproses',
            $message,
            'return_approved',
            'return',
            ['return_id' => $bookReturn->id, 'borrow_id' => $borrow->id]
        );

        if (! $profile || ! $profile->notification_enabled) {
            return;
        }

        if ($profile->notification_email && ! empty($user->email)) {
            $this->sendMailAfterResponse(
                function () use ($user, $message, $details, $books): void {
                    Mail::to($user->email)->send(new BorrowNotificationMail(
                        subjectLine: 'Return Completed - Bookera',
                        title: 'Pengembalian Diproses',
                        bodyMessage: $message,
                        details: $details,
                        books: $books,
                        footerNote: 'Terima kasih, pengembalian buku Anda sudah selesai diproses.',
                    ));
                },
                'Failed to send return approved email',
                ['recipient_id' => $user->id, 'return_id' => $bookReturn->id]
            );
        }

        if ($profile->notification_whatsapp && $profile->phone_number) {
            $returnBookList = $bookReturn->details
                ->map(function ($detail) {
                    return '  • '.($detail->bookCopy->book->title ?? 'Unknown');
                })
                ->implode("\n");

            $whatsappMessage = "✅ *BOOKERA — Pengembalian Diproses*\n"
                ."━━━━━━━━━━━━━━━━━━━━\n\n"
                ."Halo, *{$userName}*! 👋\n\n"
                ."Pengembalian buku Anda telah berhasil diproses.\n\n"
                ."📋 *Detail Pengembalian:*\n"
                .'  🔖 Kode Pinjam : *'.$borrow->borrow_code."*\n"
                .'  📅 Tanggal Diproses : '.Carbon::parse($bookReturn->return_date)->format('d M Y')."\n\n"
                ."📚 *Buku yang Dikembalikan:*\n"
                .$returnBookList."\n\n"
                ."━━━━━━━━━━━━━━━━━━━━\n"
                ."Terima kasih telah mengembalikan buku.\n\n"
                .'_Bookera — Perpustakaan Digital_';

            try {
                (new FonnteService)->send($profile->phone_number, $whatsappMessage);
            } catch (\Throwable $exception) {
                Log::error('Failed to send return approved WhatsApp: '.$exception->getMessage());
            }
        }
    }

    public function notifyFineCreated(Fine $fine): void
    {
        $fine->loadMissing(['fineType', 'borrow.user.profile', 'borrow.borrowDetails.bookCopy.book']);

        $borrow = $fine->borrow;
        $user = $borrow?->user;
        $profile = $user?->profile;
        $userName = $profile?->full_name ?? $user?->email ?? 'Unknown User';

        [$bookTitles, $moreText, $books] = $this->summarizeBooks(
            $borrow->borrowDetails,
            fn ($detail) => $detail->bookCopy->book->title ?? 'Unknown'
        );

        $fineTypeName = $fine->fineType->name ?? 'Denda';
        $amount = number_format((float) $fine->amount, 0, ',', '.');
        $message = "Denda sebesar Rp {$amount} telah dikenakan untuk buku {$bookTitles}{$moreText} ({$fineTypeName}).";
        $details = [
            'Fine ID' => '#'.$fine->id,
            'Borrow ID' => '#'.$borrow->id,
            'Borrow Code' => $borrow->borrow_code,
            'Fine Type' => $fineTypeName,
            'Amount' => 'Rp '.$amount,
            'Status' => ucfirst($fine->status),
        ];

        DatabaseNotificationService::send(
            $borrow->user_id,
            'Denda Baru Dikenakan',
            $message,
            'fine_created',
            'fine',
            ['fine_id' => $fine->id, 'borrow_id' => $borrow->id]
        );

        if (! $profile || ! $profile->notification_enabled) {
            return;
        }

        if ($profile->notification_email && ! empty($user->email)) {
            $this->sendMailAfterResponse(
                function () use ($user, $message, $details, $books): void {
                    Mail::to($user->email)->send(new BorrowNotificationMail(
                        subjectLine: 'Fine Created - Bookera',
                        title: 'Denda Baru Dikenakan',
                        bodyMessage: $message,
                        details: $details,
                        books: $books,
                        footerNote: 'Silakan cek detail denda Anda di aplikasi Bookera.',
                    ));
                },
                'Failed to send fine email',
                ['recipient_id' => $user->id, 'fine_id' => $fine->id]
            );
        }

        if ($profile->notification_whatsapp && $profile->phone_number) {
            $fineBookList = $borrow->borrowDetails
                ->map(function ($detail) {
                    return '  • '.($detail->bookCopy->book->title ?? 'Unknown');
                })
                ->take(2)
                ->implode("\n").($moreText ? "\n  {$moreText}" : '');

            $whatsappMessage = "💰 *BOOKERA — Notifikasi Denda*\n"
                ."━━━━━━━━━━━━━━━━━━━━\n\n"
                ."Halo, *{$userName}*! 👋\n\n"
                ."Denda baru telah dikenakan pada akun Anda.\n\n"
                ."📋 *Detail Denda:*\n"
                .'  🔖 Kode Pinjam : *'.$borrow->borrow_code."*\n"
                .'  ⚠️ Jenis Denda  : '.$fineTypeName."\n"
                .'  💵 Jumlah Denda : *Rp '.$amount."*\n\n"
                ."📚 *Buku Terkait:*\n"
                .$fineBookList."\n\n"
                ."━━━━━━━━━━━━━━━━━━━━\n"
                ."Silakan cek detail denda di aplikasi Bookera.\n\n"
                .'_Bookera — Perpustakaan Digital_';

            try {
                (new FonnteService)->send($profile->phone_number, $whatsappMessage);
            } catch (\Throwable $exception) {
                Log::error('Failed to send fine WhatsApp: '.$exception->getMessage());
            }
        }
    }

    public function notifyLostBookReported(LostBook $lostBook): void
    {
        $lostBook->loadMissing(['borrow.user.profile', 'bookCopy.book']);

        $borrow = $lostBook->borrow;
        $bookCopy = $lostBook->bookCopy;
        $user = $borrow?->user;
        $profile = $user?->profile;
        $borrowId = $borrow?->id;
        $borrowCode = $borrow?->borrow_code ?? 'N/A';

        $userName = $profile?->full_name ?? $user?->email ?? 'Unknown User';
        $bookTitle = $bookCopy?->book?->title ?? 'Unknown';
        $copyCode = $bookCopy?->copy_code ?? 'N/A';

        $admins = User::with('profile')->where('role', 'admin')->get();

        foreach ($admins as $admin) {
            $adminName = $admin?->profile?->full_name ?? $admin?->email ?? 'Admin';

            $whatsappMessage = "⚠️ *BOOKERA — Buku Hilang Dilaporkan*\n"
                ."━━━━━━━━━━━━━━━━━━━━\n\n"
                ."Halo, *{$adminName}*! 👋\n\n"
                ."{$userName} melaporkan buku hilang.\n\n"
                ."📋 *Detail Laporan:*\n"
                .'  🔖 Kode Pinjam : *'.$borrowCode."*\n"
                .'  📘 Judul Buku  : '.$bookTitle."\n"
                .'  🏷️ Kode Copy   : '.$copyCode."\n\n"
                ."━━━━━━━━━━━━━━━━━━━━\n"
                ."Silakan verifikasi laporan ini di dashboard Bookera.\n\n"
                .'_Bookera — Perpustakaan Digital_';

            $this->dispatchNotification(
                $admin,
                'Buku Hilang Dilaporkan',
                "User {$userName} reported lost book: {$bookTitle} (Copy: {$copyCode}) - Borrow #{$borrowId}",
                'lost_book_report',
                'lost_book',
                ['lost_book_id' => $lostBook->id, 'borrow_id' => $borrowId],
                fn () => new BorrowNotificationMail(
                    subjectLine: 'Lost Book Reported - Bookera',
                    title: 'Buku Hilang Dilaporkan',
                    bodyMessage: "User {$userName} reported lost book: {$bookTitle} (Copy: {$copyCode}) - Borrow #{$borrowId}",
                    details: [
                        'Lost Book ID' => '#'.$lostBook->id,
                        'Borrow ID' => '#'.$borrowId,
                        'Borrower' => $userName,
                        'Book Title' => $bookTitle,
                        'Copy Code' => $copyCode,
                    ],
                    books: [$bookTitle],
                    footerNote: 'Silakan cek dan verifikasi laporan buku hilang ini.',
                ),
                $whatsappMessage,
                true,
                true
            );
        }
    }

    private function dispatchNotification(
        object $recipient,
        string $title,
        string $message,
        string $type,
        string $module,
        array $data,
        ?callable $mailFactory = null,
        ?string $whatsappMessage = null,
        bool $sendMail = true,
        bool $sendWhatsApp = true
    ): void {
        DatabaseNotificationService::send(
            $recipient->id,
            $title,
            $message,
            $type,
            $module,
            $data
        );

        $profile = $recipient?->profile;

        if (! $profile || ! $profile->notification_enabled) {
            return;
        }

        if ($sendMail && $profile->notification_email && $mailFactory && ! empty($recipient->email)) {
            $this->sendMailAfterResponse(
                function () use ($recipient, $mailFactory): void {
                    Mail::to($recipient->email)->send($mailFactory());
                },
                'Failed to send borrow email notification',
                [
                    'recipient_id' => $recipient->id,
                    'title' => $title,
                ]
            );
        }

        if ($sendWhatsApp && $profile->notification_whatsapp && $profile->phone_number && $whatsappMessage) {
            try {
                (new FonnteService)->send($profile->phone_number, $whatsappMessage);
            } catch (\Throwable $exception) {
                Log::error('Failed to send borrow WhatsApp notification: '.$exception->getMessage(), [
                    'recipient_id' => $recipient->id,
                    'title' => $title,
                ]);
            }
        }
    }

    private function sendMailAfterResponse(callable $callback, string $logMessage, array $context = []): void
    {
        app()->terminating(function () use ($callback, $logMessage, $context): void {
            try {
                $callback();
            } catch (\Throwable $exception) {
                Log::error($logMessage.': '.$exception->getMessage(), $context + [
                    'exception' => $exception,
                ]);
            }
        });
    }

    /**
     * @return array{0:string,1:string,2:array<int, string>}
     */
    private function summarizeBooks($details, callable $titleResolver): array
    {
        $details = collect($details);

        $bookTitles = $details->take(2)->map($titleResolver)->implode(', ');
        $totalBooks = $details->count();
        $moreText = $totalBooks > 2 ? ' and '.($totalBooks - 2).' more' : '';
        $books = $details->map($titleResolver)->values()->all();

        return [$bookTitles, $moreText, $books];
    }
}
