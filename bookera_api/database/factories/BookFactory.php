<?php

namespace Database\Factories;

use App\Models\Book;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BookFactory extends Factory
{
    protected $model = Book::class;

    private static array $languages = ['Indonesian', 'English', 'Javanese', 'Sundanese', 'Arabic'];

    public function definition(): array
    {
        $title = fake()->catchPhrase();
        $slugBase = Str::slug($title);
        $slugSuffix = Str::lower((string) Str::ulid());

        $isbn = fake()->boolean(85) ? fake()->unique()->isbn13() : null;

        return [
            'slug' => $slugBase.'-'.$slugSuffix,
            'title' => $title,
            'isbn' => $isbn,
            'description' => fake()->optional(0.9)->paragraphs(3, true),
            'publication_year' => fake()->optional(0.9)->year(),
            'language' => fake()->randomElement(self::$languages),
            'cover_image' => 'https://picsum.photos/seed/'.$slugBase.'-'.$slugSuffix.'/400/600',
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

    public function withCover(): static
    {
        return $this->state(fn (array $attributes) => [
            'cover_image' => 'https://picsum.photos/seed/'.fake()->word().'/200/300',
        ]);
    }
}
