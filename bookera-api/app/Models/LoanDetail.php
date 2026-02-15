<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoanDetail extends Model
{
    protected $table = 'loan_details';

    protected $fillable = [
        'loan_id',
        'book_copy_id',
        'approval_status',
        'note',
    ];

    protected $casts = [
        'approval_status' => 'string',
        'note' => 'string',
    ];

    public function loan()
    {
        return $this->belongsTo(Loan::class);
    }

    public function bookCopy()
    {
        return $this->belongsTo(BookCopy::class);
    }
}
