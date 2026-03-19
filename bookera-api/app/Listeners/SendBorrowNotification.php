<?php

namespace App\Listeners;

use App\Models\User;
use App\Services\FonnteService;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendBorrowNotification
{
    public function __construct()
    {
        //
    }

    public function handle($event): void
    {
        // ── Direct borrow notification (admin created borrow for a member) ──────
        if ($event instanceof \App\Events\BorrowRequested) {
            $borrow = $event->borrow;

            $admins = User::where('role', 'admin')->pluck('id');

            $bookTitles = $borrow->borrowDetails->map(function ($detail) {
                return $detail->bookCopy->book->title ?? 'Unknown';
            })->take(2)->implode(', ');

            $totalBooks = $borrow->borrowDetails->count();
            $moreText = $totalBooks > 2 ? ' and '.($totalBooks - 2).' more' : '';

            foreach ($admins as $adminId) {
                NotificationService::send(
                    $adminId,
                    'New Direct Borrow',
                    "{$borrow->user->profile->full_name} has a new borrow {$bookTitles}{$moreText} (Borrow #{$borrow->id})",
                    'borrow_request',
                    'borrow',
                    ['borrow_id' => $borrow->id]
                );
            }
        }

        // ── Borrow request created ─────────────────────────────────────────────
        if ($event instanceof \App\Events\BorrowRequestCreated) {
            $borrowRequest = $event->borrowRequest;

            $admins = User::where('role', 'admin')->pluck('id');

            $bookTitles = $borrowRequest->borrowRequestDetails->map(function ($detail) {
                return $detail->book->title ?? 'Unknown';
            })->take(2)->implode(', ');

            $totalBooks = $borrowRequest->borrowRequestDetails->count();
            $moreText = $totalBooks > 2 ? ' and '.($totalBooks - 2).' more' : '';
            $userName = $borrowRequest->user->profile->full_name ?? $borrowRequest->user->email;

            foreach ($admins as $adminId) {
                NotificationService::send(
                    $adminId,
                    'New Borrow Request',
                    "{$userName} wants to borrow {$bookTitles}{$moreText} (Request #{$borrowRequest->id})",
                    'borrow_request',
                    'borrow',
                    ['request_id' => $borrowRequest->id]
                );
            }
        }

        // ── Borrow request approved ────────────────────────────────────────────
        if ($event instanceof \App\Events\BorrowRequestApproved) {
            $borrowRequest = $event->borrowRequest;
            $borrow = $event->borrow;
            $user = $borrowRequest->user;
            $profile = $user->profile;

            NotificationService::send(
                $borrowRequest->user_id,
                'Borrow Request Approved',
                'Your borrow request #'.$borrowRequest->id.' has been approved. Borrow code: '.$borrow->borrow_code.'. Please come to the library on '.\Carbon\Carbon::parse($borrowRequest->borrow_date)->format('d M Y').'.',
                'borrow_request_approved',
                'borrow',
                ['request_id' => $borrowRequest->id, 'borrow_code' => $borrow->borrow_code]
            );

            if ($profile && $profile->notification_enabled) {
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
                    .'  📅 Tanggal Ambil : '.\Carbon\Carbon::parse($borrowRequest->borrow_date)->format('d M Y')."\n"
                    .'  🔄 Batas Kembali : '.\Carbon\Carbon::parse($borrowRequest->return_date)->format('d M Y')."\n\n"
                    ."📚 *Buku yang Dipinjam:*\n"
                    .$bookList."\n\n"
                    ."━━━━━━━━━━━━━━━━━━━━\n"
                    ."⚠️ Tunjukkan *kode pinjam* kepada petugas saat mengambil buku.\n\n"
                    .'_Bookera — Perpustakaan Digital_';

                if ($profile->notification_email) {
                    try {
                        Mail::to($user->email)
                            ->send(new \App\Mail\BorrowRequestApprovedMail($borrowRequest, $borrow));
                    } catch (\Exception $e) {
                        Log::error('Failed to send borrow approval email: '.$e->getMessage());
                    }
                }

                if ($profile->notification_whatsapp && $profile->phone_number) {
                    try {
                        (new FonnteService)->send($profile->phone_number, $message);
                    } catch (\Exception $e) {
                        Log::error('Failed to send borrow approval WhatsApp: '.$e->getMessage());
                    }
                }
            }
        }

        // ── Borrow request rejected ────────────────────────────────────────────
        if ($event instanceof \App\Events\BorrowRequestRejected) {
            $borrowRequest = $event->borrowRequest;
            $user = $borrowRequest->user;
            $profile = $user->profile;

            $reason = $borrowRequest->reject_reason ? (' Reason: '.$borrowRequest->reject_reason) : '';

            NotificationService::send(
                $borrowRequest->user_id,
                'Borrow Request Rejected',
                'Your borrow request #'.$borrowRequest->id.' has been rejected.'.$reason,
                'borrow_request_rejected',
                'borrow',
                ['request_id' => $borrowRequest->id, 'reject_reason' => $borrowRequest->reject_reason]
            );

            if ($profile && $profile->notification_enabled) {
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

                if ($profile->notification_email) {
                    try {
                        Mail::to($user->email)
                            ->send(new \App\Mail\BorrowRequestRejectedMail($borrowRequest));
                    } catch (\Exception $e) {
                        Log::error('Failed to send borrow rejection email: '.$e->getMessage());
                    }
                }

                if ($profile->notification_whatsapp && $profile->phone_number) {
                    try {
                        (new FonnteService)->send($profile->phone_number, $message);
                    } catch (\Exception $e) {
                        Log::error('Failed to send borrow rejection WhatsApp: '.$e->getMessage());
                    }
                }
            }
        }

        // ── Borrow request cancelled ───────────────────────────────────────────
        if ($event instanceof \App\Events\BorrowRequestCancelled) {
            $borrowRequest = $event->borrowRequest;
            $userName = $borrowRequest->user->profile->full_name ?? $borrowRequest->user->email;

            $admins = User::where('role', 'admin')->pluck('id');

            foreach ($admins as $adminId) {
                NotificationService::send(
                    $adminId,
                    'Borrow Request Cancelled',
                    "{$userName} cancelled borrow request #{$borrowRequest->id}",
                    'borrow_request_cancelled',
                    'borrow',
                    ['request_id' => $borrowRequest->id]
                );
            }
        }
    }
}
