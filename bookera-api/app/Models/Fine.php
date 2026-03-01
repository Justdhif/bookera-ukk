<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $borrow_id
 * @property int $fine_type_id
 * @property float $amount
 * @property \Illuminate\Support\Carbon|null $paid_at
 * @property string $status
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Borrow $borrow
 * @property-read \App\Models\FineType $fineType
 */
class Fine extends Model
{
    protected $fillable = [
        'borrow_id',
        'fine_type_id',
        'amount',
        'paid_at',
        'status',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    /**
     * Get the borrow that has this fine
     */
    public function borrow(): BelongsTo
    {
        return $this->belongsTo(Borrow::class);
    }

    /**
     * Get the fine type
     */
    public function fineType(): BelongsTo
    {
        return $this->belongsTo(FineType::class);
    }
}
