<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class LostBookDetailFactory extends Factory
{
    public function definition(): array
    {
        return [
            'lost_book_id' => null,
            'book_copy_id' => null,
            'lost_date' => fake()->date(),
            'notes' => fake()->sentence(),
        ];
    }
}
