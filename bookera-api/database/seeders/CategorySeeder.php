<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Fiction',      'description' => 'Books that contain imaginative or made-up stories, characters, and events.'],
            ['name' => 'Non-Fiction',  'description' => 'Books based on real facts, events, and information.'],
            ['name' => 'Science',      'description' => 'Books about scientific topics, research, and discoveries.'],
            ['name' => 'Technology',   'description' => 'Books about computers, programming, and modern technology.'],
            ['name' => 'History',      'description' => 'Books about past events, civilizations, and historical figures.'],
            ['name' => 'Biography',    'description' => 'Books about the lives of real people.'],
            ['name' => 'Self-Help',    'description' => 'Books designed to help readers improve themselves and their lives.'],
            ['name' => 'Children',     'description' => 'Books specifically written for children and young readers.'],
            ['name' => 'Education',    'description' => 'Educational books and textbooks for learning.'],
            ['name' => 'Arts',         'description' => 'Books about art, music, painting, and creative expression.'],
            ['name' => 'Philosophy',   'description' => 'Books exploring fundamental questions about existence, knowledge, and ethics.'],
            ['name' => 'Religion',     'description' => 'Books about religious beliefs, practices, and spirituality.'],
        ];

        Category::factory()
            ->count(count($categories))
            ->sequence(...array_map(
                fn ($c) => ['slug' => Str::slug($c['name']), ...$c],
                $categories
            ))
            ->create();
    }
}
