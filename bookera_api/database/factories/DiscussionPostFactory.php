<?php

namespace Database\Factories;

use App\Models\DiscussionPost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class DiscussionPostFactory extends Factory
{
    protected $model = DiscussionPost::class;

    public function definition(): array
    {
        $caption = fake()->optional(0.92)->realTextBetween(80, 280);

        return [
            'user_id' => User::query()->inRandomOrder()->value('id') ?? User::factory(),
            'caption' => $caption,
            'slug' => Str::slug(Str::limit($caption ?? fake()->sentence(4), 40, '')).'-'.Str::random(8),
            'likes_count' => 0,
            'comments_count' => 0,
            'taken_down_at' => null,
            'taken_down_reason' => null,
        ];
    }
}
