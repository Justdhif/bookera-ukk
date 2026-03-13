<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BorrowDetail>
 */
class BorrowDetailFactory extends Factory
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
            'book_copy_id' => null, // Set in seeder
            'note' => fake()->sentence(),
            'status' => fake()->randomElement(['borrowed', 'returned', 'lost']),
        ];
    }
}
