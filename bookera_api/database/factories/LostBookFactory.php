<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class LostBookFactory extends Factory
{

    public function definition(): array
    {
        return [
            'borrow_id' => null, 
            'book_copy_id' => null, 
            'estimated_lost_date' => fake()->date(),
            'notes' => fake()->sentence(),
        ];
    }
}
