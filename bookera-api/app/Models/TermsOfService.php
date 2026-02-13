<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $title
 * @property string $content
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class TermsOfService extends Model
{
    protected $table = 'terms_of_services';

    protected $fillable = [
        'title',
        'content',
    ];
}
