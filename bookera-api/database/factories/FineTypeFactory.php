<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\FineType>
 */
class FineTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
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
