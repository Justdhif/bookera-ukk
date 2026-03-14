<?php

namespace App\Events;

use App\Models\Borrow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BorrowRejected
{
    use Dispatchable, SerializesModels;

    public Borrow $borrow;
    public ?string $rejectionReason;

    public function __construct(Borrow $borrow, ?string $rejectionReason = null)
    {
        $this->borrow          = $borrow;
        $this->rejectionReason = $rejectionReason;
    }
}
