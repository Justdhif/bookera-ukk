<?php

namespace Database\Factories;

use App\Models\NewsComment;
use App\Models\News;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NewsCommentFactory extends Factory
{
    protected $model = NewsComment::class;

    public function definition(): array
    {
        return [
            'news_id'   => News::inRandomOrder()->first()->id ?? News::factory(),
            'user_id'   => User::inRandomOrder()->first()->id ?? User::factory(),
            'parent_id' => null, // Top level comment by default
            'content'   => $this->faker->paragraph(),
            'image'     => null,
        ];
    }
}
