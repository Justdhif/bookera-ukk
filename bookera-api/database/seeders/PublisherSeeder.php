<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Publisher;
use Illuminate\Support\Str;
use App\Helpers\AvatarHelper;

class PublisherSeeder extends Seeder
{
    public function run(): void
    {
        $publishers = [
            [
                'name' => 'Penguin Random House',
                'description' => 'The world\'s largest trade book publisher. It was formed in 2013 by the merger of Penguin Group and Random House.',
            ],
            [
                'name' => 'HarperCollins',
                'description' => 'One of the world\'s largest publishing companies. The company is headquartered in New York City.',
            ],
            [
                'name' => 'Simon & Schuster',
                'description' => 'An American publishing house founded in New York City in 1924 by Richard L. Simon and M. Lincoln Schuster.',
            ],
            [
                'name' => 'Hachette Book Group',
                'description' => 'The second largest trade publishing company in the United States.',
            ],
            [
                'name' => 'Macmillan Publishers',
                'description' => 'One of the five major publishers in the world.',
            ],
            [
                'name' => 'Oxford University Press',
                'description' => 'The largest university press in the world and part of the University of Oxford.',
            ],
            [
                'name' => 'Scholastic Corporation',
                'description' => 'The world\'s largest publisher and distributor of children\'s books.',
            ],
        ];

        foreach ($publishers as $data) {

            $publisher = Publisher::firstOrCreate(
                ['slug' => Str::slug($data['name'])],
                [
                    'name' => $data['name'],
                    'description' => $data['description'],
                    'photo' => 'temp',
                    'is_active' => true,
                ]
            );

            $publisher->update([
                'photo' => AvatarHelper::generateDefaultAvatar($publisher->id),
            ]);
        }
    }
}
