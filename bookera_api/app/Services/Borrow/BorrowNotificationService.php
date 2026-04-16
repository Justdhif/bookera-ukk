<?php

namespace App\Services\Borrow;

use App\Mail\BorrowNotificationMail;
use App\Mail\BorrowRequestApprovedMail;
use App\Mail\BorrowRequestRejectedMail;
use App\Models\Borrow;
use App\Models\BorrowRequest;
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
            fn ($detail) => $detail->bookCopy->book->title ?? $this->t('Unknown')
        );

        $userName = $borrow->user?->profile?->full_name ?? $borrow->user?->email ?? $this->t('User');
        $message = $this->t(':name has a new borrow :books (Borrow #:id)', [
            'name' => $userName,
            'books' => $bookTitles.$moreText,
            'id' => $borrow->id,
        ]);
        $details = [
            $this->t('Borrow ID') => '#'.$borrow->id,
            $this->t('Borrow Code') => $borrow->borrow_code,
            $this->t('Borrower') => $userName,
            $this->t('Borrow Date') => Carbon::parse($borrow->borrow_date)->format('d M Y'),
            $this->t('Return Date') => Carbon::parse($borrow->return_date)->format('d M Y'),
        ];

        $admins = User::with('profile')->where('role', 'admin')->get();

        foreach ($admins as $admin) {
            $this->dispatchNotification(
                $admin,
                $this->t('New Direct Borrow'),
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
                    subjectLine: $this->t('New Direct Borrow - Bookera'),
                    title: $this->t('New Direct Borrow'),
                    bodyMessage: $message,
                    details: $details,
                    books: $books,
                    footerNote: $this->t('This borrow was created directly in the system.'),
                ),
                $this->t('New borrow received from :name. Borrow #:id. Books: :books', [
                    'name' => $userName,
                    'id' => $borrow->id,
                    'books' => $bookTitles.$moreText,
                ]),
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
            fn ($detail) => $detail->bookCopy->book->title ?? $this->t('Unknown')
        );

        $user = $borrow->user;
        $profile = $user?->profile;
        $userName = $profile?->full_name ?? $user?->email ?? $this->t('User');

        $message = $this->t('Your borrow request for :books has been created successfully. Borrow code: :code.', [
            'books' => $bookTitles.$moreText,
            'code' => $borrow->borrow_code,
        ]);
        $details = [
            $this->t('Borrow ID') => '#'.$borrow->id,
            $this->t('Borrow Code') => $borrow->borrow_code,
            $this->t('Borrow Date') => Carbon::parse($borrow->borrow_date)->format('d M Y'),
            $this->t('Return Date') => Carbon::parse($borrow->return_date)->format('d M Y'),
            $this->t('Status') => ucfirst($borrow->status),
        ];

        DatabaseNotificationService::send(
            $user->id,
            $this->t('New Borrow'),
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
                        subjectLine: $this->t('Borrow Created - Bookera'),
                        title: $this->t('New Borrow'),
                        bodyMessage: $message,
                        details: $details,
                        books: $books,
                        footerNote: $this->t('Keep the borrow code for the library pickup process.'),
                    ));
                },
                'Failed to send borrow issued email',
                ['recipient_id' => $user->id, 'borrow_id' => $borrow->id]
            );
        }

        if ($profile->notification_whatsapp && $profile->phone_number) {
            $bookList = $borrow->borrowDetails
                ->map(function ($detail) {
                    return '  • '.($detail->bookCopy->book->title ?? $this->t('Unknown'));
                })
                ->take(2)
                ->implode("\n").($moreText ? "\n  {$moreText}" : '');

            $whatsappMessage = $this->t("📚 *BOOKERA — New Borrow*\n")
                ."━━━━━━━━━━━━━━━━━━━━\n\n"
                .$this->t('Hello, *:name*! 👋', ['name' => $userName])."\n\n"
                .$this->t('Your borrow request has been created successfully.')."\n\n"
                .$this->t('📋 *Borrow Details:*')."\n"
                .$this->t('  🔖 Borrow Code : *:code*', ['code' => $borrow->borrow_code])."\n"
                .$this->t('  📅 Borrow Date : :date', ['date' => Carbon::parse($borrow->borrow_date)->format('d M Y')])."\n"
                .$this->t('  🔄 Return Date : :date', ['date' => Carbon::parse($borrow->return_date)->format('d M Y')])."\n\n"
                .$this->t('📚 *Borrowed Books:*')."\n"
                .$bookList."\n\n"
                ."━━━━━━━━━━━━━━━━━━━━\n"
                .$this->t('Keep the borrow code for the library pickup process.')."\n\n"
                .$this->t('_Bookera — Digital Library_');

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
            fn ($detail) => $detail->book->title ?? $this->t('Unknown')
        );

        $userName = $borrowRequest->user?->profile?->full_name ?? $borrowRequest->user?->email ?? $this->t('User');
        $message = $this->t(':name wants to borrow :books (Request #:id)', [
            'name' => $userName,
            'books' => $bookTitles.$moreText,
            'id' => $borrowRequest->id,
        ]);
        $details = [
            $this->t('Request ID') => '#'.$borrowRequest->id,
            $this->t('Borrower') => $userName,
            $this->t('Borrow Date') => Carbon::parse($borrowRequest->borrow_date)->format('d M Y'),
            $this->t('Return Date') => Carbon::parse($borrowRequest->return_date)->format('d M Y'),
            $this->t('Status') => $this->t('Processing'),
        ];

        $admins = User::with('profile')->where('role', 'admin')->get();

        foreach ($admins as $admin) {
            $this->dispatchNotification(
                $admin,
                $this->t('New Borrow Request'),
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
                    subjectLine: $this->t('New Borrow Request - Bookera'),
                    title: $this->t('New Borrow Request'),
                    bodyMessage: $message,
                    details: $details,
                    books: $books,
                    footerNote: $this->t('Review the request from the admin dashboard.'),
                ),
                $this->t('Borrow request from :name: :books', [
                    'name' => $userName,
                    'books' => $bookTitles.$moreText,
                ]),
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
            $this->t('Borrow Request Approved'),
            $this->t('Your borrow request #:id has been approved. Borrow code: :code. Please come to the library on :date.', [
                'id' => $borrowRequest->id,
                'code' => $borrow->borrow_code,
                'date' => Carbon::parse($borrowRequest->borrow_date)->format('d M Y'),
            ]),
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
                return '  • '.($detail->book->title ?? $this->t('Unknown'));
            })->implode("\n");

            $message = $this->t("🎉 *BOOKERA — Borrow Approved!*\n")
                ."━━━━━━━━━━━━━━━━━━━━\n\n"
                .$this->t('Hello, *:name*! 👋', ['name' => $profile->full_name])."\n\n"
                .$this->t('Your borrow request has been *approved* by the library staff.')."\n\n"
                .$this->t('📋 *Borrow Details:*')."\n"
                .$this->t('  🔖 Request No.   : #:id', ['id' => $borrowRequest->id])."\n"
                .$this->t('  🎫 Borrow Code   : *:code*', ['code' => $borrow->borrow_code])."\n"
                .$this->t('  📅 Pickup Date : :date', ['date' => Carbon::parse($borrowRequest->borrow_date)->format('d M Y')])."\n"
                .$this->t('  🔄 Return Date : :date', ['date' => Carbon::parse($borrowRequest->return_date)->format('d M Y')])."\n\n"
                .$this->t('📚 *Borrowed Books:*')."\n"
                .$bookList."\n\n"
                ."━━━━━━━━━━━━━━━━━━━━\n"
                .$this->t('⚠️ Show the *borrow code* to the staff when picking up the books.')."\n\n"
                .$this->t('_Bookera — Digital Library_');

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
            $this->t('Borrow Request Rejected'),
            $this->t('Your borrow request #:id has been rejected.:reason', [
                'id' => $borrowRequest->id,
                'reason' => $reason,
            ]),
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
                return '  • '.($detail->book->title ?? $this->t('Unknown'));
            })->implode("\n");

            $reasonText = $borrowRequest->reject_reason
                ? $this->t("📝 *Reason for Rejection:*\n  :reason\n\n", ['reason' => $borrowRequest->reject_reason])
                : '';

            $message = $this->t("❌ *BOOKERA — Borrow Rejected*\n")
                ."━━━━━━━━━━━━━━━━━━━━\n\n"
                .$this->t('Hello, *:name*! 👋', ['name' => $profile->full_name])."\n\n"
                .$this->t('Sorry, borrow request *#:id* could not be processed.', ['id' => $borrowRequest->id])."\n\n"
                .$this->t('📚 *Requested Books:*')."\n"
                .$bookList."\n\n"
                .$reasonText
                .$this->t('💡 You can submit a new request by selecting available books.')."\n\n"
                ."━━━━━━━━━━━━━━━━━━━━\n"
                .$this->t('_Bookera — Digital Library_');

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
            fn ($detail) => $detail->book->title ?? $this->t('Unknown')
        );

        $userName = $borrowRequest->user?->profile?->full_name ?? $borrowRequest->user?->email ?? $this->t('User');
        $message = $this->t(':name cancelled borrow request #:id', [
            'name' => $userName,
            'id' => $borrowRequest->id,
        ]);
        $details = [
            $this->t('Request ID') => '#'.$borrowRequest->id,
            $this->t('Borrower') => $userName,
            $this->t('Status') => $this->t('Cancelled'),
            $this->t('Books') => $bookTitles.$moreText,
        ];

        $admins = User::with('profile')->where('role', 'admin')->get();

        foreach ($admins as $admin) {
            $this->dispatchNotification(
                $admin,
                $this->t('Borrow Request Cancelled'),
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
                    subjectLine: $this->t('Borrow Request Cancelled - Bookera'),
                    title: $this->t('Borrow Request Cancelled'),
                    bodyMessage: $message,
                    details: $details,
                    books: $books,
                    footerNote: $this->t('The request was cancelled by the user.'),
                ),
                $this->t(':name cancelled borrow request #:id. Books: :books', [
                    'name' => $userName,
                    'id' => $borrowRequest->id,
                    'books' => $bookTitles.$moreText,
                ]),
                true,
                false
            );
        }
    }
}
