<?php

namespace Database\Seeders;

use App\Models\Author;
use Illuminate\Database\Seeder;

class AuthorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a diverse set of authors
        Author::factory(20)->active()->create();

        // A few inactive authors
        Author::factory(3)->inactive()->create();
    }
}
