<?php

namespace App\Models;

use App\Models\Borrow;
use App\Models\LostBookDetail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LostBook extends Model
{
    use HasFactory;

    protected $fillable = [
        'borrow_id',
    ];

    public function borrow(): BelongsTo
    {
        return $this->belongsTo(Borrow::class);
    }

    public function lostBookDetails(): HasMany
    {
        return $this->hasMany(LostBookDetail::class);
    }

    public function details(): HasMany
    {
        return $this->lostBookDetails();
    }
}
