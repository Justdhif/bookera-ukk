<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiscountKey extends Model
{
    protected $fillable = [
        'key',
        'name',
        'description',
    ];

    public function membershipDiscounts()
    {
        return $this->hasMany(MembershipDiscount::class);
    }

}
