<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BorrowRequestDetail extends Model
{
    use HasFactory;

    protected $table = 'borrow_request_details';

    protected $fillable = [
        'borrow_request_id',
        'book_id',
    ];

    public function borrowRequest()
    {
        return $this->belongsTo(BorrowRequest::class);
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }
}
