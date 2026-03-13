<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Fine>
 */
class FineFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'borrow_id' => null, // Set in seeder
            'fine_type_id' => null, // Set in seeder
            'amount' => fake()->randomFloat(2, 10, 500),
            'paid_at' => now(),
            'status' => fake()->randomElement(['unpaid', 'paid', 'waived']),
            'notes' => fake()->sentence(),
        ];
    }
}
