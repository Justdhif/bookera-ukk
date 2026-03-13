<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use App\Helpers\AvatarHelper;

/**
 * @property int $id
 * @property int $user_id
 * @property string $full_name
 * @property string|null $gender
 * @property \Illuminate\Support\Carbon|null $birth_date
 * @property string|null $avatar
 * @property string|null $phone_number
 * @property string|null $address
 * @property string|null $bio
 * @property string|null $identification_number
 * @property string|null $occupation
 * @property string|null $institution
 * @property bool $notification_enabled
 * @property bool $notification_email
 * @property bool $notification_whatsapp
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 */
class UserProfile extends Model
{
    use HasFactory;

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
        'notification_enabled',
        'notification_email',
        'notification_whatsapp',
    ];

    protected $casts = [
        'notification_enabled'    => 'boolean',
        'notification_email'      => 'boolean',
        'notification_whatsapp'   => 'boolean',
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

    protected function phoneNumber(): Attribute
    {
        return Attribute::make(
            set: function ($value) {
                if ($value === null || $value === '') {
                    return null;
                }
                // Remove all non-digit characters
                $digits = preg_replace('/\D/', '', $value);
                // Convert leading 0 to 62
                if (str_starts_with($digits, '0')) {
                    $digits = '62' . substr($digits, 1);
                }
                return $digits;
            }
        );
    }
}
