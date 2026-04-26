<?php

namespace Database\Seeders;

use App\Models\BookCopy;
use App\Models\BookReturn;
use App\Models\Borrow;
use App\Models\BorrowDetail;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BorrowSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if ($this->command->confirm('Apakah Anda ingin membuat data seeder peminjaman?')) {
            $user = User::where('email', 'justdhif418@gmail.com')->first();

            if (!$user) {
                $this->command->warn('User justdhif418 tidak ditemukan. Silakan jalankan UserSeeder terlebih dahulu.');
                return;
            }

            $count = (int) $this->command->ask('Berapa banyak data peminjaman yang ingin dibuat?', 5);

            if ($count <= 0) {
                $this->command->info("Melewati pembuatan seeder peminjaman.");
                return;
            }

            for ($i = 0; $i < $count; $i++) {
                $bookCopy = BookCopy::inRandomOrder()->first();

                if (!$bookCopy) {
                    $this->command->warn("Data Book Copy tidak ditemukan. Silakan jalankan BookCopySeeder terlebih dahulu.");
                    break;
                }

                $status = ($i === 0) ? 'open' : 'close';

                if ($status === 'open') {
                    $returnDate = Carbon::create(date('Y'), 4, 15);
                    $borrowDate = Carbon::create(date('Y'), 4, rand(1, 14));
                } else {
                    $borrowDate = Carbon::now()->subDays(rand(5, 40));
                    $returnDate = (clone $borrowDate)->addDays(7); 
                    $actualReturnDate = (clone $borrowDate)->addDays(rand(3, 10));
                }

                $borrow = Borrow::create([
                    'user_id' => $user->id,
                    'borrow_request_id' => null,
                    'borrow_code' => 'BRW-' . strtoupper(Str::random(8)),
                    'qr_code_path' => null,
                    'borrow_date' => $borrowDate->format('Y-m-d'),
                    'return_date' => $returnDate->format('Y-m-d'),
                    'status' => $status,
                ]);

                if ($status === 'open') {
                    BorrowDetail::create([
                        'borrow_id' => $borrow->id,
                        'book_copy_id' => $bookCopy->id,
                        'status' => 'borrowed',
                        'note' => null,
                    ]);
                } else {
                    BorrowDetail::create([
                        'borrow_id' => $borrow->id,
                        'book_copy_id' => $bookCopy->id,
                        'status' => 'returned',
                        'note' => 'Dikembalikan dengan baik melalui seeder',
                    ]);

                    $bookReturn = BookReturn::create([
                        'borrow_id' => $borrow->id,
                        'book_copy_id' => $bookCopy->id,
                        'return_date' => $actualReturnDate->format('Y-m-d'),
                        'condition' => 'good',
                    ]);
                }
            }

            $this->command->info("✅ Berhasil membuat $count data peminjaman.");
        } else {
            $this->command->info("Melewati pembuatan seeder peminjaman (Borrow).");
        }
    }
}
