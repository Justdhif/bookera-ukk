<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ActivityLog>
 */
class ActivityLogFactory extends Factory
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
            'action' => fake()->word(),
            'module' => fake()->word(),
            'description' => fake()->sentence(),
            'subject_type' => fake()->word(),
            'subject_id' => null, // Set in seeder
            'old_data' => json_encode(['key' => fake()->word()]),
            'new_data' => json_encode(['key' => fake()->word()]),
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
        ];
    }
}
