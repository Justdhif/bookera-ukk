<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class BookReturnFactory extends Factory
{

    public function definition(): array
    {
        return [
            'borrow_id' => null, 
            'return_date' => fake()->date(),
        ];
    }
}
