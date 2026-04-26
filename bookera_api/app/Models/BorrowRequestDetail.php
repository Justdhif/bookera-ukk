<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Book;
use App\Models\BookCopy;
use App\Models\BorrowRequest;

class BorrowRequestDetail extends Model
{
    use HasFactory;

    protected $table = 'borrow_request_details';

    protected $fillable = [
        'borrow_request_id',
        'book_id',
        'approval_status',
        'reject_reason',
        'book_copy_id',
    ];

    protected $casts = [
        'approval_status' => 'string',
        'reject_reason' => 'string',
    ];

    public function borrowRequest()
    {
        return $this->belongsTo(BorrowRequest::class);
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function bookCopy()
    {
        return $this->belongsTo(BookCopy::class);
    }
}
