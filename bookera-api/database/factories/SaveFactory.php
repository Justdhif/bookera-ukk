<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Save>
 */
class SaveFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => null, // Set in seeder
            'name' => fake()->name(),
            'slug' => fake()->word(),
            'description' => fake()->sentence(),
            'cover' => fake()->word(),
        ];
    }
}
