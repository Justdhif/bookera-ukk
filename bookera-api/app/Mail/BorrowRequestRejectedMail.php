<?php

namespace App\Mail;

use App\Models\BorrowRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BorrowRequestRejectedMail extends Mailable
{
    use Queueable, SerializesModels;

    public BorrowRequest $borrowRequest;

    public function __construct(BorrowRequest $borrowRequest)
    {
        $this->borrowRequest = $borrowRequest;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Borrow Request Rejected - Bookera',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.borrow-request-rejected',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
