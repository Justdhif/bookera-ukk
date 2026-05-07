<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use Database\Seeders\BookSeeder;
use Database\Seeders\GenreSeeder;

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
            GenreSeeder::class,
            AuthorSeeder::class,
            PublisherSeeder::class,
            PrivacyPolicySeeder::class,
            TermsOfServiceSeeder::class,
            BookSeeder::class,
            BookFavoriteSeeder::class,
            BookCopySeeder::class,

            ActivityLogSeeder::class,
            BookReviewSeeder::class,
            FineTypeSeeder::class,
            BorrowSeeder::class,
            MembershipPlanSeeder::class,
            ComplaintSeeder::class,
            NewsSeeder::class,
            MembershipDiscountSeeder::class,
        ]);

        Schema::enableForeignKeyConstraints();

        $this->command->info('✅ Seeding berhasil diselesaikan!');
    }
}
