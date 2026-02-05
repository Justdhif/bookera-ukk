<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Fiction',
                'description' => 'Books that contain imaginative or made-up stories, characters, and events.',
                'icon' => '📚'
            ],
            [
                'name' => 'Non-Fiction',
                'description' => 'Books based on real facts, events, and information.',
                'icon' => '📖'
            ],
            [
                'name' => 'Science',
                'description' => 'Books about scientific topics, research, and discoveries.',
                'icon' => '🔬'
            ],
            [
                'name' => 'Technology',
                'description' => 'Books about computers, programming, and modern technology.',
                'icon' => '💻'
            ],
            [
                'name' => 'History',
                'description' => 'Books about past events, civilizations, and historical figures.',
                'icon' => '🏛️'
            ],
            [
                'name' => 'Biography',
                'description' => 'Books about the lives of real people.',
                'icon' => '👤'
            ],
            [
                'name' => 'Self-Help',
                'description' => 'Books designed to help readers improve themselves and their lives.',
                'icon' => '🌟'
            ],
            [
                'name' => 'Children',
                'description' => 'Books specifically written for children and young readers.',
                'icon' => '🧸'
            ],
            [
                'name' => 'Education',
                'description' => 'Educational books and textbooks for learning.',
                'icon' => '🎓'
            ],
            [
                'name' => 'Arts',
                'description' => 'Books about art, music, painting, and creative expression.',
                'icon' => '🎨'
            ],
            [
                'name' => 'Philosophy',
                'description' => 'Books exploring fundamental questions about existence, knowledge, and ethics.',
                'icon' => '🤔'
            ],
            [
                'name' => 'Religion',
                'description' => 'Books about religious beliefs, practices, and spirituality.',
                'icon' => '🕊️'
            ],
        ];

        foreach ($categories as $category) {
            Category::create([
                'slug' => Str::slug($category['name']),
                'name' => $category['name'],
                'description' => $category['description'],
                'icon' => $category['icon'],
            ]);
        }
    }
}
