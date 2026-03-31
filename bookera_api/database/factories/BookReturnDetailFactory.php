<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class BookReturnDetailFactory extends Factory
{

    public function definition(): array
    {
        return [
            'book_return_id' => null, 
            'book_copy_id' => null, 
            'condition' => fake()->randomElement(['good', 'damaged', 'lost']),
        ];
    }
}
