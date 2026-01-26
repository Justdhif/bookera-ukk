<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookCopy extends Model
{
    protected $table = 'book_copies';

    protected $fillable = [
        'book_id',
        'copy_code',
        'status',
    ];

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function loanDetails()
    {
        return $this->hasMany(LoanDetail::class);
    }
}
