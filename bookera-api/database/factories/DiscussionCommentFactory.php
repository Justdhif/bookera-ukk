<?php

namespace Database\Factories;

use App\Models\DiscussionComment;
use App\Models\DiscussionPost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DiscussionComment>
 */
class DiscussionCommentFactory extends Factory
{
    protected $model = DiscussionComment::class;

    public function definition(): array
    {
        return [
            'user_id' => User::query()->inRandomOrder()->value('id') ?? User::factory(),
            'post_id' => DiscussionPost::query()->inRandomOrder()->value('id') ?? DiscussionPost::factory(),
            'parent_id' => null,
            'content' => fake()->realTextBetween(30, 200),
        ];
    }
}
