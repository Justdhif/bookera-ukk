<?php

namespace Database\Factories;

use App\Enums\UserOccupation;
use App\Models\UserProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserProfileFactory extends Factory
{
    protected $model = UserProfile::class;

    public function definition(): array
    {
        return [
            'user_id' => null,
            'username' => fake()->unique()->userName(),
            'full_name' => fake()->name(),
            'gender' => fake()->randomElement(['male', 'female', 'prefer_not_to_say', 'croissant']),
            'birth_date' => fake()->date(),
            'avatar' => fake()->word(),
            'phone_number' => fake()->unique()->numerify('628#########'),
            'address' => fake()->word(),
            'bio' => fake()->word(),
            'identification_number' => fake()->word(),
            'occupation' => fake()->randomElement(UserOccupation::values()),
            'institution' => fake()->word(),
            'notification_enabled' => true,
            'notification_email' => true,
            'notification_whatsapp' => true,
        ];
    }
}
