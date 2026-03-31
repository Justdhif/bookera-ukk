<?php

namespace Database\Factories;

use App\Models\DiscussionLike;
use App\Models\DiscussionPost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DiscussionLikeFactory extends Factory
{
    protected $model = DiscussionLike::class;

    public function definition(): array
    {
        return [
            'user_id' => User::query()->inRandomOrder()->value('id') ?? User::factory(),
            'post_id' => DiscussionPost::query()->inRandomOrder()->value('id') ?? DiscussionPost::factory(),
        ];
    }
}
