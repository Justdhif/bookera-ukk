<?php

namespace Database\Seeders;

use App\Models\Publisher;
use Illuminate\Database\Seeder;

class PublisherSeeder extends Seeder
{
    public function run(): void
    {
        $count = (int) $this->command->ask('Berapa banyak Penerbit yang ingin dibuat?', 5);
        if ($count > 0) {
            Publisher::factory($count)->create();
            $this->command->info("✅ Berhasil membuat {$count} data Penerbit.");
        }
    }
}
