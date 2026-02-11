<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaveItem extends Model
{
    protected $table = 'save_items';

    protected $fillable = [
        'save_id',
        'book_id'
    ];

    public function bookSave()
    {
        return $this->belongsTo(Save::class);
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }
}
