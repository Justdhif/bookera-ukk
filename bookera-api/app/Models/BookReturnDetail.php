<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookReturnDetail extends Model
{
    protected $table = 'book_return_details';

    protected $fillable = [
        'book_return_id',
        'book_copy_id',
        'condition',
    ];

    public function bookReturn()
    {
        return $this->belongsTo(BookReturn::class);
    }

    public function bookCopy()
    {
        return $this->belongsTo(BookCopy::class);
    }
}
