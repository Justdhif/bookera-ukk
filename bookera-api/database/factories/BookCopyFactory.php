<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\BookCopy;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BookCopy>
 */
class BookCopyFactory extends Factory
{
    protected $model = BookCopy::class;

    public function definition(): array
    {
        return [
            'book_id' => Book::query()->inRandomOrder()->value('id') ?? Book::factory(),
            'copy_code' => strtoupper(fake()->unique()->bothify('BK-####-??')),
            'status' => fake()->randomElement(['available', 'borrowed', 'lost', 'damaged']),
        ];
    }

    public function available(): static
    {
        return $this->state(fn (array $attributes) => ['status' => 'available']);
    }

    public function borrowed(): static
    {
        return $this->state(fn (array $attributes) => ['status' => 'borrowed']);
    }

    public function damaged(): static
    {
        return $this->state(fn (array $attributes) => ['status' => 'damaged']);
    }

    public function lost(): static
    {
        return $this->state(fn (array $attributes) => ['status' => 'lost']);
    }
}
