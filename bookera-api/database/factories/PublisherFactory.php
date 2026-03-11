<?php

namespace Database\Factories;

use App\Models\Publisher;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Publisher>
 */
class PublisherFactory extends Factory
{
    protected $model = Publisher::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->company();

        return [
            'slug'        => Str::slug($name) . '-' . fake()->unique()->numerify('###'),
            'name'        => $name,
            'description' => fake()->optional(0.8)->paragraph(2),
            'photo'       => 'https://ui-avatars.com/api/?name=' . urlencode($name) . '&size=200&background=random',
            'is_active'   => fake()->boolean(90),
        ];
    }

    /**
     * Indicate that the publisher is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the publisher is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
