<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SaveItemFactory extends Factory
{

    public function definition(): array
    {
        return [
            'save_id' => null, 
            'book_id' => null, 
        ];
    }
}
