<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class BorrowDetailFactory extends Factory
{

    public function definition(): array
    {
        return [
            'borrow_id' => null, 
            'book_copy_id' => null, 
            'note' => fake()->sentence(),
            'status' => fake()->randomElement(['borrowed', 'returned', 'lost']),
        ];
    }
}
