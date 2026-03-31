<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SaveFactory extends Factory
{

    public function definition(): array
    {
        return [
            'user_id' => null, 
            'name' => fake()->name(),
            'slug' => fake()->word(),
            'description' => fake()->sentence(),
            'cover' => fake()->word(),
        ];
    }
}
