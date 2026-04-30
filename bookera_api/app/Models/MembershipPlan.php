<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MembershipPlan extends Model
{
    protected $fillable = [
        'plan_id',
        'name',
        'price',
        'description',
    ];
}
