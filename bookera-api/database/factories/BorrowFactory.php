<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Borrow>
 */
class BorrowFactory extends Factory
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
            'borrow_request_id' => null, // Set in seeder
            'borrow_code' => fake()->word(),
            'qr_code_path' => fake()->imageUrl(),
            'borrow_date' => fake()->date(),
            'return_date' => fake()->date(),
            'status' => fake()->randomElement(['open', 'close']),
        ];
    }
}
