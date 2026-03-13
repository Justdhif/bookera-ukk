<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserProfile>
 */
class UserProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => null, // Set in seeder
            'full_name' => fake()->name(),
            'gender' => fake()->randomElement(['male', 'female', 'prefer_not_to_say']),
            'birth_date' => fake()->date(),
            'avatar' => fake()->word(),
            'phone_number' => fake()->word(),
            'address' => fake()->word(),
            'bio' => fake()->word(),
            'identification_number' => fake()->word(),
            'occupation' => fake()->word(),
            'institution' => fake()->word(),
            'notification_enabled' => fake()->word(),
            'notification_email' => fake()->unique()->safeEmail(),
            'notification_whatsapp' => fake()->word(),
        ];
    }
}
