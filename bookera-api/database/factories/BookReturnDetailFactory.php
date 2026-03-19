<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BookReturnDetail>
 */
class BookReturnDetailFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'book_return_id' => null, // Set in seeder
            'book_copy_id' => null, // Set in seeder
            'condition' => fake()->randomElement(['good', 'damaged', 'lost']),
        ];
    }
}
