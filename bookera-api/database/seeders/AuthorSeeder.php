<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Author;
use Illuminate\Support\Str;
use App\Helpers\AvatarHelper;

class AuthorSeeder extends Seeder
{
    public function run(): void
    {
        $authors = [
            [
                'name' => 'J.K. Rowling',
                'bio' => 'British author best known for the Harry Potter fantasy series.',
            ],
            [
                'name' => 'Stephen King',
                'bio' => 'American author of horror and supernatural fiction.',
            ],
            [
                'name' => 'Haruki Murakami',
                'bio' => 'Japanese writer known for magical realism.',
            ],
            [
                'name' => 'George Orwell',
                'bio' => 'English novelist and essayist known for social criticism.',
            ],
            [
                'name' => 'Agatha Christie',
                'bio' => 'Best-selling detective fiction writer.',
            ],
            [
                'name' => 'Toni Morrison',
                'bio' => 'American novelist and Nobel Prize winner.',
            ],
            [
                'name' => 'Gabriel García Márquez',
                'bio' => 'Colombian novelist and Nobel Prize winner.',
            ],
            [
                'name' => 'Fyodor Dostoevsky',
                'bio' => 'Russian novelist exploring human psychology.',
            ],
            [
                'name' => 'Jane Austen',
                'bio' => 'English novelist known for romantic fiction.',
            ],
            [
                'name' => 'Leo Tolstoy',
                'bio' => 'Russian author of War and Peace.',
            ],
        ];

        foreach ($authors as $data) {

            $author = Author::firstOrCreate(
                ['slug' => Str::slug($data['name'])],
                [
                    'name' => $data['name'],
                    'bio' => $data['bio'],
                    'photo' => 'temp',
                    'is_active' => true,
                ]
            );

            $author->update([
                'photo' => AvatarHelper::generateDefaultAvatar($author->id),
            ]);
        }
    }
}
