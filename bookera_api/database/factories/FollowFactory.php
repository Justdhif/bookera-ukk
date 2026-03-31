<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class FollowFactory extends Factory
{

    public function definition(): array
    {
        return [
            'user_id' => null, 
            'followable_id' => null, 
            'followable_type' => fake()->word(),
        ];
    }
}
