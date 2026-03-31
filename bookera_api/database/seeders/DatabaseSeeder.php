<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->command->info('=== Seeder Basis Data Bookera Interaktif ===');
        $this->command->info('Masukkan angka 0 jika Anda tidak ingin membuat data untuk tabel tersebut.');

        Schema::disableForeignKeyConstraints();

        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            AuthorSeeder::class,
            PublisherSeeder::class,
            PrivacyPolicySeeder::class,
            TermsOfServiceSeeder::class,
            BookSeeder::class,
            BookFavoriteSeeder::class,
            BookCopySeeder::class,
            DiscussionSeeder::class,
            ActivityLogSeeder::class,
            BookReviewSeeder::class,
        ]);

        Schema::enableForeignKeyConstraints();

        $this->command->info('✅ Seeding berhasil diselesaikan!');
    }
}
