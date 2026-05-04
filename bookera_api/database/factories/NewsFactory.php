<?php

namespace Database\Factories;

use App\Models\News;
use App\Models\User;
use App\Helpers\SlugGenerator;
use Illuminate\Database\Eloquent\Factories\Factory;

class NewsFactory extends Factory
{
    protected $model = News::class;

    public function definition(): array
    {
        $title = $this->faker->sentence(6);
        return [
            'admin_id' => User::where('role', 'admin')->inRandomOrder()->first()->id ?? User::factory()->create(['role' => 'admin'])->id,
            'title'    => $title,
            'slug'     => SlugGenerator::generate('news', 'slug', $title),
            'content'  => $this->faker->paragraphs(5, true),
            'image'    => "https://picsum.photos/seed/news_" . rand(1, 1000) . "/1200/800",
        ];
    }
}
