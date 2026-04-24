<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class FineTypeFactory extends Factory
{
    public function definition(): array
    {
        $type = fake()->randomElement(['lost', 'damaged', 'late']);

        if ($type === 'damaged') {
            return [
                'name' => fake()->words(3, true),
                'type' => $type,
                'amount' => 0,
                'percentage' => fake()->randomElement([10, 25, 50]),
                'description' => fake()->sentence(),
            ];
        }

        if ($type === 'lost') {
            return [
                'name' => fake()->words(3, true),
                'type' => $type,
                'amount' => 0,
                'percentage' => 100,
                'description' => fake()->sentence(),
            ];
        }

        return [
            'name' => fake()->words(3, true),
            'type' => $type,
            'amount' => fake()->randomFloat(2, 10, 500),
            'percentage' => null,
            'description' => fake()->sentence(),
        ];
    }
}
