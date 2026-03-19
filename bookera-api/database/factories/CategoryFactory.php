<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

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
