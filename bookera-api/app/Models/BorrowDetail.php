<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BorrowDetail extends Model
{
    protected $table = 'borrow_details';

    protected $fillable = [
        'borrow_id',
        'book_copy_id',
        'note',
        'status',
    ];

    protected $casts = [
        'note'   => 'string',
        'status' => 'string',
    ];

    public function borrow()
    {
        return $this->belongsTo(Borrow::class);
    }

    public function bookCopy()
    {
        return $this->belongsTo(BookCopy::class);
    }
}
