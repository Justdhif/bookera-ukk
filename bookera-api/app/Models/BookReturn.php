<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookReturn extends Model
{
    protected $table = 'book_returns';

    protected $fillable = [
        'loan_id',
        'return_date',
        'approval_status',
    ];

    public function loan()
    {
        return $this->belongsTo(Loan::class);
    }

    public function bookReturnDetails()
    {
        return $this->hasMany(BookReturnDetail::class);
    }

    public function details()
    {
        return $this->bookReturnDetails();
    }
}
