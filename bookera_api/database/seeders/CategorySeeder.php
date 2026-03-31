<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $count = (int) $this->command->ask('Berapa banyak Kategori yang ingin dibuat?', 5);
        if ($count > 0) {
            Category::factory($count)->create();
            $this->command->info("✅ Berhasil membuat {$count} data Kategori.");
        }
    }
}
