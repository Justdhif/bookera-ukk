<?php

namespace App\Mail;

use App\Models\Borrow;
use App\Models\BorrowRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BorrowRequestApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public BorrowRequest $borrowRequest;

    public Borrow $borrow;

    public function __construct(BorrowRequest $borrowRequest, Borrow $borrow)
    {
        $this->borrowRequest = $borrowRequest;
        $this->borrow = $borrow;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Borrow Request Approved - Bookera',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.borrow-request-approved',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
