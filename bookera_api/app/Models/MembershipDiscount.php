<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MembershipDiscount extends Model
{
    protected $fillable = [
        'discount_key',
        'name',
        'discount_percentage',
        'description',
    ];
}
