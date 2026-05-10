<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MembershipDiscount extends Model
{
    protected $fillable = [
        'discount_key_id',
        'discount_percentage',
    ];

    public function discountKey()
    {
        return $this->belongsTo(DiscountKey::class);
    }
}
