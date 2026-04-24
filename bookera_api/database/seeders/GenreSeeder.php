<?php

namespace Database\Seeders;

use App\Models\Genre;
use Illuminate\Database\Seeder;

class GenreSeeder extends Seeder
{
    public function run(): void
    {
        $count = (int) $this->command->ask('Berapa banyak Genre yang ingin dibuat?', 5);
        if ($count > 0) {
            Genre::factory($count)->create();
            $this->command->info("✅ Berhasil membuat {$count} data Genre.");
        }
    }
}
