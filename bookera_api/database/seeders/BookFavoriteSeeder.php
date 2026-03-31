<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\User;
use Illuminate\Database\Seeder;

class BookFavoriteSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'noob1234five@gmail.com')->first();

        if (!$user) {
            $this->command->warn('Gagal membuat data buku favorite: User khusus "noob1234five@gmail.com" tidak ditemukan.');
            return;
        }

        if ($this->command->confirm('Apakah Anda ingin membuat data Buku Favorit?', true)) {
            $books = Book::all();
            
            if ($books->count() === 0) {
                $this->command->warn('Gagal membuat data buku favorit: Tidak ada data buku yang tersedia.');
                return;
            }

            $favoriteCount = ceil($books->count() / 2);
            $randomBooks = $books->random($favoriteCount)->pluck('id');

            $user->favoriteBooks()->sync($randomBooks);

            $this->command->info("✅ Berhasil membuat {$favoriteCount} data Buku Favorit.");
        } else {
            $this->command->info('⏭️ Melewati pembuatan Buku Favorit.');
        }
    }
}
