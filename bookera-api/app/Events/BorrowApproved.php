<?php

namespace App\Events;

use App\Models\Borrow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BorrowApproved
{
    use Dispatchable, SerializesModels;

    public Borrow $borrow;

    public function __construct(Borrow $borrow)
    {
        $this->borrow = $borrow;
    }
}
