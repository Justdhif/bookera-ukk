<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DiscussionPostReport>
 */
class DiscussionPostReportFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reporter_id' => null, // Set in seeder
            'post_id' => null, // Set in seeder
            'reason' => fake()->randomElement(['spam', 'harassment', 'inappropriate']),
            'description' => fake()->sentence(),
            'status' => fake()->randomElement(['pending', 'reviewed', 'dismissed']),
            'reviewed_by' => fake()->word(),
            'reviewed_at' => fake()->word(),
            'admin_note' => fake()->sentence(),
        ];
    }
}
