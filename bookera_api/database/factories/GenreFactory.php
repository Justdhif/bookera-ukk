<?php

namespace Database\Factories;

use App\Models\Genre;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class GenreFactory extends Factory
{
    protected $model = Genre::class;

    public function definition(): array
    {
        $name = ucwords(fake()->unique()->words(rand(1, 2), true));

        return [
            'slug' => Str::slug($name),
            'name' => $name,
            'description' => fake()->sentence(),
        ];
    }
}
