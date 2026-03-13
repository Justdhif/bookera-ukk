<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Notification>
 */
class NotificationFactory extends Factory
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
            'title' => fake()->name(),
            'message' => fake()->word(),
            'type' => fake()->word(),
            'module' => fake()->word(),
            'data' => fake()->word(),
            'read_at' => fake()->word(),
        ];
    }
}
