<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $save_id
 * @property int $book_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Save $bookSave
 * @property-read \App\Models\Book $book
 */
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
