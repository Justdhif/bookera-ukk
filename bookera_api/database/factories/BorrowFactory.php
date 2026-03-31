<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class BorrowFactory extends Factory
{

    public function definition(): array
    {
        return [
            'user_id' => null, 
            'borrow_request_id' => null, 
            'borrow_code' => fake()->word(),
            'qr_code_path' => fake()->imageUrl(),
            'borrow_date' => fake()->date(),
            'return_date' => fake()->date(),
            'status' => fake()->randomElement(['open', 'close']),
        ];
    }
}
