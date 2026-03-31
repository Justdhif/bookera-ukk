<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class NotificationFactory extends Factory
{

    public function definition(): array
    {
        return [
            'user_id' => null, 
            'title' => fake()->name(),
            'message' => fake()->word(),
            'type' => fake()->word(),
            'module' => fake()->word(),
            'data' => fake()->word(),
            'read_at' => fake()->word(),
        ];
    }
}
