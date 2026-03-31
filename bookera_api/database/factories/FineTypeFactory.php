<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class FineTypeFactory extends Factory
{

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'type' => fake()->randomElement(['lost', 'damaged', 'late']),
            'amount' => fake()->randomFloat(2, 10, 500),
            'description' => fake()->sentence(),
        ];
    }
}
