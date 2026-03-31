<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ActivityLogFactory extends Factory
{

    public function definition(): array
    {
        return [
            'user_id' => null, 
            'action' => fake()->word(),
            'module' => fake()->word(),
            'description' => fake()->sentence(),
            'subject_type' => fake()->word(),
            'subject_id' => null, 
            'old_data' => json_encode(['key' => fake()->word()]),
            'new_data' => json_encode(['key' => fake()->word()]),
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
        ];
    }
}
