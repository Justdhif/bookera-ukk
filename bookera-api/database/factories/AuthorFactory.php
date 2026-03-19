<?php

namespace Database\Factories;

use App\Models\Author;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Author>
 */
class AuthorFactory extends Factory
{
    protected $model = Author::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->name();
        $slugBase = Str::slug($name);
        $slugSuffix = Str::lower((string) Str::ulid());

        return [
            'slug' => $slugBase.'-'.$slugSuffix,
            'name' => $name,
            'bio' => fake()->optional(0.8)->paragraph(3),
            'photo' => 'https://ui-avatars.com/api/?name='.urlencode($name).'&size=200&background=random',
            'is_active' => fake()->boolean(90),
        ];
    }

    /**
     * Indicate that the author is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the author is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
