<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $book_return_id
 * @property int $book_copy_id
 * @property string $condition
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\BookReturn $bookReturn
 * @property-read \App\Models\BookCopy $bookCopy
 */
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
