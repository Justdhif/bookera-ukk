<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BorrowRequest>
 */
class BorrowRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => null, // Set in seeder
            'borrow_date' => fake()->date(),
            'return_date' => fake()->date(),
            'approval_status' => fake()->randomElement(['processing', 'canceled', 'approved', 'rejected']),
            'reject_reason' => fake()->sentence(),
        ];
    }
}
