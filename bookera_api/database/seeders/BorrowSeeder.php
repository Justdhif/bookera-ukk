<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\BookCopy;
use App\Models\BookReturn;
use App\Models\Borrow;
use App\Models\BorrowDetail;
use App\Models\FineBorrow;
use App\Models\FineType;
use App\Models\LostBook;
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
                $this->command->warn('User justdhif418@gmail.com tidak ditemukan. Silakan jalankan UserSeeder terlebih dahulu.');
                return;
            }

            $count = (int) $this->command->ask('Berapa banyak data peminjaman yang ingin dibuat?', 5);

            if ($count <= 0) {
                $this->command->info("Melewati pembuatan seeder peminjaman.");
                return;
            }

            // Get fine types for calculations
            $fineTypeLate = FineType::where('type', 'late')->first();
            $fineTypeLost = FineType::where('type', 'lost')->first();
            $fineTypeDamaged = FineType::where('type', 'damaged')->get(); // Get all damaged types

            for ($i = 0; $i < $count; $i++) {
                // Randomly decide number of unique books (1 to 3)
                $numBooks = rand(1, 3);
                $borrowedCopies = [];

                for ($j = 0; $j < $numBooks; $j++) {
                    // Randomly decide quantity for this book (1 to 2)
                    $qty = rand(1, 2);
                    
                    // Pick a random book that has available copies
                    $book = Book::whereHas('copies', function($q) {
                        $q->where('status', 'available');
                    })->inRandomOrder()->first();

                    if (!$book) continue;

                    $copies = $book->copies()->where('status', 'available')->limit($qty)->get();
                    foreach ($copies as $copy) {
                        $borrowedCopies[] = $copy;
                        // Mark as borrowed temporarily so it's not picked again in this loop
                        $copy->update(['status' => 'borrowed']);
                    }
                }

                if (empty($borrowedCopies)) {
                    $this->command->warn("Tidak ada Book Copy yang tersedia untuk dipinjam.");
                    break;
                }

                $status = ($i === 0) ? 'open' : 'close';
                $actualReturnDate = null;
                
                // Dates logic
                if ($status === 'open') {
                    $borrowDate = Carbon::now()->subDays(rand(1, 5));
                    $returnDate = (clone $borrowDate)->addDays(7);
                } else {
                    // For closed borrows, we want some to be late
                    $borrowDate = Carbon::now()->subDays(rand(20, 60));
                    $returnDate = (clone $borrowDate)->addDays(7);
                    
                    // Random actual return date (can be late)
                    $actualReturnDate = (clone $borrowDate)->addDays(rand(3, 15));
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

                // Determine fine scenario for closed borrows
                $scenario = 'none';
                if ($status === 'close') {
                    $rand = rand(1, 10);
                    if ($rand <= 2) {
                        $scenario = 'lost'; // 20% chance
                    } elseif ($rand <= 5) {
                        $scenario = 'late_damaged'; // 30% chance (can be late, damaged, or both)
                    } else {
                        $scenario = 'none'; // 50% chance clean return
                    }
                }

                $damagedCopyIds = [];
                foreach ($borrowedCopies as $index => $copy) {
                    $detailStatus = ($status === 'open') ? 'borrowed' : 'returned';
                    $note = null;

                    // Ensure at least one book is lost if scenario is lost, or one is damaged if scenario is late_damaged
                    $forceScenario = ($index === 0);

                    if ($scenario === 'lost') {
                        if ($forceScenario || rand(0, 1) == 1) {
                            $detailStatus = 'lost';
                            $note = 'Buku dinyatakan hilang.';
                        }
                    } elseif ($scenario === 'late_damaged') {
                        if ($forceScenario || rand(0, 1) == 1) {
                            $note = 'Buku dikembalikan dengan kerusakan.';
                        }
                    }

                    BorrowDetail::create([
                        'borrow_id' => $borrow->id,
                        'book_copy_id' => $copy->id,
                        'status' => $detailStatus,
                        'note' => $note ?: ($status === 'close' ? 'Dikembalikan melalui seeder' : null),
                    ]);

                    if ($status === 'close') {
                        if ($detailStatus === 'returned') {
                            $condition = ($scenario === 'late_damaged' && $note) ? 'damaged' : 'good';
                            BookReturn::create([
                                'borrow_id' => $borrow->id,
                                'book_copy_id' => $copy->id,
                                'return_date' => $actualReturnDate->format('Y-m-d'),
                                'condition' => $condition,
                            ]);
                            $copy->update(['status' => 'available']);
                            
                            if ($condition === 'damaged') {
                                $damagedCopyIds[] = $copy->id;
                            }
                        } else {
                            // Lost
                            LostBook::create([
                                'borrow_id' => $borrow->id,
                                'book_copy_id' => $copy->id,
                                'lost_date' => $actualReturnDate->format('Y-m-d'),
                                'notes' => 'Buku hilang saat peminjaman.',
                            ]);
                            $copy->update(['status' => 'lost']);
                        }
                    }
                }

                // Create Fines based on Scenario
                if ($status === 'close') {
                    if ($scenario === 'lost') {
                        // Lost fine rule: Cannot be combined with late/damaged
                        $lostDetails = $borrow->details()->where('status', 'lost')->get();
                        foreach ($lostDetails as $lostDetail) {
                            $book = $lostDetail->bookCopy->book;
                            $amount = $book->price; // 100% of price for lost
                            
                            FineBorrow::create([
                                'borrow_id' => $borrow->id,
                                'fine_type_id' => $fineTypeLost->id,
                                'amount' => $amount,
                                'status' => 'unpaid',
                                'notes' => "Denda buku hilang: " . $book->title,
                            ]);
                        }
                    } elseif ($scenario === 'late_damaged') {
                        // Late fine
                        $daysLate = $actualReturnDate->diffInDays($returnDate, false);
                        if ($daysLate > 0 && $fineTypeLate) {
                            $totalLateFine = $daysLate * $fineTypeLate->amount;
                            FineBorrow::create([
                                'borrow_id' => $borrow->id,
                                'fine_type_id' => $fineTypeLate->id,
                                'amount' => $totalLateFine,
                                'status' => 'unpaid',
                                'notes' => "Denda terlambat $daysLate hari.",
                            ]);
                        }

                        // Damaged fine
                        foreach ($damagedCopyIds as $copyId) {
                            $copy = BookCopy::find($copyId);
                            $book = $copy->book;
                            // Pick a random damaged type (light, medium, heavy)
                            $type = $fineTypeDamaged->random();
                            $amount = ($type->percentage / 100) * $book->price;

                            FineBorrow::create([
                                'borrow_id' => $borrow->id,
                                'fine_type_id' => $type->id,
                                'amount' => $amount,
                                'status' => 'unpaid',
                                'notes' => "Denda buku rusak ({$type->name}): " . $book->title,
                            ]);
                        }
                    }
                }
            }

            $this->command->info("✅ Berhasil membuat $count data peminjaman dengan skenario denda.");
        } else {
            $this->command->info("Melewati pembuatan seeder peminjaman (Borrow).");
        }
    }
}
