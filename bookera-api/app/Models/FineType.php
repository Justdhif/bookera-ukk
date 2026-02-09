<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FineType extends Model
{
    protected $fillable = [
        'name',
        'type',
        'amount',
        'description',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    /**
     * Get all fines of this type
     */
    public function fines(): HasMany
    {
        return $this->hasMany(Fine::class);
    }
}
