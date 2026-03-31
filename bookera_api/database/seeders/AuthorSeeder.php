<?php

namespace Database\Seeders;

use App\Models\Author;
use Illuminate\Database\Seeder;

class AuthorSeeder extends Seeder
{
    public function run(): void
    {
        $count = (int) $this->command->ask('Berapa banyak Penulis yang ingin dibuat?', 5);
        if ($count > 0) {
            Author::factory($count)->create();
            $this->command->info("✅ Berhasil membuat {$count} data Penulis.");
        }
    }
}
