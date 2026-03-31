<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class BorrowRequestDetailFactory extends Factory
{

    public function definition(): array
    {
        return [
            'borrow_request_id' => null, 
            'book_id' => null, 
        ];
    }
}
