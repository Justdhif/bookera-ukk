<?php

namespace Database\Factories;

use App\Models\UserProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserProfileFactory extends Factory
{
    protected $model = UserProfile::class;

    public function definition(): array
    {
        return [
            'user_id' => null,
            'full_name' => fake()->name(),
            'gender' => fake()->randomElement(['male', 'female', 'prefer_not_to_say']),
            'birth_date' => fake()->date(),
            'avatar' => fake()->word(),
            'phone_number' => fake()->unique()->numerify('628#########'),
            'address' => fake()->word(),
            'bio' => fake()->word(),
            'identification_number' => fake()->word(),
            'occupation' => fake()->word(),
            'institution' => fake()->word(),
            'notification_enabled' => true,
            'notification_email' => true,
            'notification_whatsapp' => true,
        ];
    }
}
