<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class BorrowRequestFactory extends Factory
{

    public function definition(): array
    {
        return [
            'user_id' => null, 
            'borrow_date' => fake()->date(),
            'return_date' => fake()->date(),
            'approval_status' => fake()->randomElement(['processing', 'canceled', 'approved', 'rejected']),
            'reject_reason' => fake()->sentence(),
        ];
    }
}
