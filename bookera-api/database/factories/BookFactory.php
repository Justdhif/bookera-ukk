<?php

namespace Database\Factories;

use App\Models\Book;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Book>
 */
class BookFactory extends Factory
{
    protected $model = Book::class;

    private static array $languages = ['Indonesian', 'English', 'Javanese', 'Sundanese', 'Arabic'];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->catchPhrase();

        return [
            'slug'             => Str::slug($title) . '-' . fake()->unique()->numerify('###'),
            'title'            => $title,
            'isbn'             => fake()->optional(0.85)->isbn13(),
            'description'      => fake()->optional(0.9)->paragraphs(3, true),
            'publication_year' => fake()->optional(0.9)->year(),
            'language'         => fake()->randomElement(self::$languages),
            'cover_image'      => null,
            'is_active'        => fake()->boolean(90),
        ];
    }

    /**
     * Indicate that the book is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the book is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the book has a cover image.
     */
    public function withCover(): static
    {
        return $this->state(fn (array $attributes) => [
            'cover_image' => 'https://picsum.photos/seed/' . fake()->word() . '/200/300',
        ]);
    }
}
