<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookReturn extends Model
{
    use HasFactory;

    protected $table = 'book_returns';

    protected $fillable = [
        'borrow_id',
        'return_date',
    ];

    public function borrow()
    {
        return $this->belongsTo(Borrow::class);
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
