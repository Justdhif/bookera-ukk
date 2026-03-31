<?php

namespace Database\Factories;

use App\Models\Publisher;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PublisherFactory extends Factory
{
    protected $model = Publisher::class;

    public function definition(): array
    {
        $name = fake()->company();
        $slugBase = Str::slug($name);
        $slugSuffix = Str::lower((string) Str::ulid());

        return [
            'slug' => $slugBase.'-'.$slugSuffix,
            'name' => $name,
            'description' => fake()->optional(0.8)->paragraph(2),
            'photo' => 'https://ui-avatars.com/api/?name='.urlencode($name).'&size=200&background=random',
            'is_active' => fake()->boolean(90),
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
