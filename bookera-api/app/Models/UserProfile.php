<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use App\Helpers\AvatarHelper;

class UserProfile extends Model
{
    protected $table = 'user_profiles';

    protected $fillable = [
        'user_id',
        'full_name',
        'gender',
        'birth_date',
        'avatar',
        'phone_number',
        'address',
        'bio',
        'identification_number',
        'occupation',
        'institution',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the avatar attribute
     * Returns uploaded avatar URL or fallback to generated avatar
     */
    protected function avatar(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                // If avatar exists in database, return full storage URL
                if ($value) {
                    return storage_image($value);
                }

                // Otherwise return generated avatar from AvatarHelper
                return AvatarHelper::generateDefaultAvatar($this->user_id);
            },
            set: fn ($value) => $value
        );
    }
}
