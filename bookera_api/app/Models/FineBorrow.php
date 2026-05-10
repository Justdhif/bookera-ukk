<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FineBorrow extends Model
{
    use HasFactory;

    protected $table = 'fine_borrows';

    protected $fillable = [
        'borrow_id',
        'fine_type_id',
        'amount',
        'original_amount',
        'discount_percentage',
        'paid_at',
        'status',
        'notes',
        'payment_method',
        'order_id',
        'snap_token',
        'va_number',
        'bank',
        'payment_payload',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'original_amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'payment_payload' => 'array',
    ];

    public function borrow(): BelongsTo
    {
        return $this->belongsTo(Borrow::class);
    }

    public function fineType(): BelongsTo
    {
        return $this->belongsTo(FineType::class);
    }
}
