<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class DiscussionPostReportFactory extends Factory
{

    public function definition(): array
    {
        return [
            'reporter_id' => null, 
            'post_id' => null, 
            'reason' => fake()->randomElement(['spam', 'harassment', 'inappropriate']),
            'description' => fake()->sentence(),
            'status' => fake()->randomElement(['pending', 'reviewed', 'dismissed']),
            'reviewed_by' => fake()->word(),
            'reviewed_at' => fake()->word(),
            'admin_note' => fake()->sentence(),
        ];
    }
}
