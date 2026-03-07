<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Follow;
use App\Models\User;
use App\Models\Author;
use App\Models\Publisher;

class FollowSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $authors = Author::all();
        $publishers = Publisher::all();

        if ($users->isEmpty() || ($authors->isEmpty() && $publishers->isEmpty())) {
            return;
        }

        // Define which authors and publishers each user follows (by index)
        $followPatterns = [
            // First user follows first 3 authors and first 2 publishers
            0 => ['authors' => [0, 1, 2], 'publishers' => [0, 1]],
            // Second user follows authors 2-5 and publishers 1-3
            1 => ['authors' => [2, 3, 4, 5], 'publishers' => [1, 2, 3]],
            // Third user follows authors 0, 4, 6 and publishers 0, 2
            2 => ['authors' => [0, 4, 6], 'publishers' => [0, 2]],
            // Fourth user follows all authors and first publisher
            3 => ['authors' => [0, 1, 2, 3, 4, 5, 6, 7], 'publishers' => [0]],
            // Fifth user follows authors 5-9 and publishers 3-5
            4 => ['authors' => [5, 6, 7, 8, 9], 'publishers' => [3, 4, 5]],
        ];

        foreach ($users as $index => $user) {
            $pattern = $followPatterns[$index] ?? [
                'authors' => array_slice(range(0, $authors->count() - 1), 0, 2),
                'publishers' => array_slice(range(0, $publishers->count() - 1), 0, 1),
            ];

            foreach ($pattern['authors'] as $authorIndex) {
                $author = $authors->get($authorIndex);
                if (!$author) continue;

                Follow::firstOrCreate([
                    'user_id' => $user->id,
                    'followable_id' => $author->id,
                    'followable_type' => Author::class,
                ]);
            }

            foreach ($pattern['publishers'] as $publisherIndex) {
                $publisher = $publishers->get($publisherIndex);
                if (!$publisher) continue;

                Follow::firstOrCreate([
                    'user_id' => $user->id,
                    'followable_id' => $publisher->id,
                    'followable_type' => Publisher::class,
                ]);
            }
        }
    }
}
