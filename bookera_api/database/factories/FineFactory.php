<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class FineFactory extends Factory
{

    public function definition(): array
    {
        return [
            'borrow_id' => null, 
            'fine_type_id' => null, 
            'amount' => fake()->randomFloat(2, 10, 500),
            'paid_at' => now(),
            'status' => fake()->randomElement(['unpaid', 'paid', 'waived']),
            'notes' => fake()->sentence(),
        ];
    }
}
