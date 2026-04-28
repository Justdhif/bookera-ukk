<?php

namespace App\Models;

use App\Helpers\AvatarHelper;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    use HasFactory;

    protected $table = 'user_profiles';

    protected $fillable = [
        'user_id',
        'username',
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
        'notification_enabled' => 'boolean',
        'notification_email' => 'boolean',
        'notification_whatsapp' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getAvatarAttribute($value)
    {
        if ($value) {
            return storage_image($value);
        }
        return AvatarHelper::generateDefaultAvatar($this->user_id);
    }

    public function setAvatarAttribute($value)
    {
        $this->attributes['avatar'] = $value;
    }

    public function setPhoneNumberAttribute($value)
    {
        if ($value === null || $value === '') {
            $this->attributes['phone_number'] = null;
            return;
        }
        $digits = preg_replace('/\D/', '', $value);
        if (str_starts_with($digits, '0')) {
            $digits = '62'.substr($digits, 1);
        }

        $this->attributes['phone_number'] = $digits;
    }
}
