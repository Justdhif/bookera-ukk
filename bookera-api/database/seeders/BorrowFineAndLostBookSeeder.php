<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Borrow;
use App\Models\BorrowDetail;
use App\Models\BookCopy;
use App\Models\User;
use App\Models\Fine;
use App\Models\FineType;
use App\Models\LostBook;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

/**
 * Seeder untuk data testing:
 * - Borrow dengan denda (Fine) dengan berbagai status (unpaid, paid, waived)
 * - Borrow dengan buku hilang (LostBook), termasuk yang sudah ada denda dan belum
 * - Borrow dengan keduanya (fine + lost book)
 *
 * Jalankan: php artisan db:seed --class=BorrowFineAndLostBookSeeder
 */
class BorrowFineAndLostBookSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::where('role', 'user')->get();
        if ($users->isEmpty()) {
            $this->command->warn('No users found. Please run UserSeeder first.');
            return;
        }

        $availableCopies = BookCopy::where('status', 'available')->get();
        if ($availableCopies->count() < 6) {
            $this->command->warn('Not enough available book copies (need at least 6). Please run BookCopySeeder first.');
            return;
        }

        $lostFineType = FineType::where('type', 'lost')->first();
        $lateFineType = FineType::where('type', 'late')->first();
        $damagedLightFineType = FineType::where('type', 'damaged')->orderBy('amount')->first();
        $damagedHeavyFineType = FineType::where('type', 'damaged')->orderByDesc('amount')->first();

        if (!$lostFineType || !$lateFineType) {
            $this->command->warn('Fine types not found. Please run FineTypeSeeder first.');
            return;
        }

        $copyIndex = 0;
        $user = $users->first();
        $user2 = $users->count() > 1 ? $users->skip(1)->first() : $user;

        // ── Skenario 1: Borrow dengan denda keterlambatan (UNPAID) ──────────
        $this->command->info('[1/6] Borrow dengan fine keterlambatan (unpaid)...');
        $borrow1 = $this->createBorrow($user, $availableCopies[$copyIndex++], [
            'borrow_date' => Carbon::now()->subDays(20),
            'return_date' => Carbon::now()->subDays(7), // sudah lewat
            'status'      => 'open',
        ]);
        Fine::create([
            'borrow_id'    => $borrow1->id,
            'fine_type_id' => $lateFineType->id,
            'amount'       => $lateFineType->amount * 7, // 7 hari telat
            'status'       => 'unpaid',
            'notes'        => 'Telat 7 hari pengembalian',
        ]);

        // ── Skenario 2: Borrow dengan denda keterlambatan (PAID) ────────────
        $this->command->info('[2/6] Borrow dengan fine keterlambatan (paid)...');
        $borrow2 = $this->createBorrow($user2, $availableCopies[$copyIndex++], [
            'borrow_date' => Carbon::now()->subDays(30),
            'return_date' => Carbon::now()->subDays(20),
            'status'      => 'close',
        ]);
        Fine::create([
            'borrow_id'    => $borrow2->id,
            'fine_type_id' => $lateFineType->id,
            'amount'       => $lateFineType->amount * 5,
            'status'       => 'paid',
            'paid_at'      => Carbon::now()->subDays(18),
            'notes'        => 'Telat 5 hari, sudah dibayar',
        ]);

        // ── Skenario 3: Borrow dengan denda kerusakan (WAIVED) ──────────────
        $this->command->info('[3/6] Borrow dengan fine kerusakan (waived)...');
        $borrow3 = $this->createBorrow($user, $availableCopies[$copyIndex++], [
            'borrow_date' => Carbon::now()->subDays(15),
            'return_date' => Carbon::now()->subDays(5),
            'status'      => 'close',
        ]);
        Fine::create([
            'borrow_id'    => $borrow3->id,
            'fine_type_id' => $damagedLightFineType->id,
            'amount'       => $damagedLightFineType->amount,
            'status'       => 'waived',
            'notes'        => 'Denda dibebaskan karena kerusakan minor',
        ]);

        // ── Skenario 4: Borrow dengan buku hilang — BELUM ada fine ──────────
        $this->command->info('[4/6] Borrow dengan lost book (belum diproses fine)...');
        $copy4 = $availableCopies[$copyIndex++];
        $borrow4 = $this->createBorrow($user2, $copy4, [
            'borrow_date' => Carbon::now()->subDays(25),
            'return_date' => Carbon::now()->subDays(10),
            'status'      => 'open',
        ]);
        LostBook::create([
            'borrow_id'           => $borrow4->id,
            'book_copy_id'        => $copy4->id,
            'estimated_lost_date' => Carbon::now()->subDays(12),
            'notes'               => 'Buku dilaporkan hilang oleh peminjam',
        ]);
        $copy4->update(['status' => 'lost']);

        // ── Skenario 5: Borrow dengan buku hilang — SUDAH ada fine (unpaid) ─
        $this->command->info('[5/6] Borrow dengan lost book + fine (unpaid)...');
        $copy5 = $availableCopies[$copyIndex++];
        $borrow5 = $this->createBorrow($user, $copy5, [
            'borrow_date' => Carbon::now()->subDays(40),
            'return_date' => Carbon::now()->subDays(26),
            'status'      => 'open',
        ]);
        LostBook::create([
            'borrow_id'           => $borrow5->id,
            'book_copy_id'        => $copy5->id,
            'estimated_lost_date' => Carbon::now()->subDays(28),
            'notes'               => 'Buku hilang, sudah diproses denda',
        ]);
        Fine::create([
            'borrow_id'    => $borrow5->id,
            'fine_type_id' => $lostFineType->id,
            'amount'       => $lostFineType->amount,
            'status'       => 'unpaid',
            'notes'        => 'Denda buku hilang, menunggu pembayaran',
        ]);
        $copy5->update(['status' => 'lost']);

        // ── Skenario 6: Borrow dengan buku hilang — fine PAID (selesai) ─────
        $this->command->info('[6/6] Borrow dengan lost book + fine (paid, selesai)...');
        $copy6 = $availableCopies[$copyIndex++];
        $borrow6 = $this->createBorrow($user2, $copy6, [
            'borrow_date' => Carbon::now()->subDays(60),
            'return_date' => Carbon::now()->subDays(46),
            'status'      => 'close',
        ]);
        LostBook::create([
            'borrow_id'           => $borrow6->id,
            'book_copy_id'        => $copy6->id,
            'estimated_lost_date' => Carbon::now()->subDays(50),
            'notes'               => 'Proses selesai, denda sudah dibayar',
        ]);
        Fine::create([
            'borrow_id'    => $borrow6->id,
            'fine_type_id' => $lostFineType->id,
            'amount'       => $lostFineType->amount,
            'status'       => 'paid',
            'paid_at'      => Carbon::now()->subDays(44),
            'notes'        => 'Denda buku hilang sudah lunas',
        ]);
        $copy6->update(['status' => 'lost']);

        $this->command->info('✅ BorrowFineAndLostBookSeeder selesai. 6 skenario dibuat.');
    }

    /**
     * Helper: buat borrow + borrow detail + QR code
     */
    private function createBorrow(User $user, BookCopy $copy, array $data): Borrow
    {
        $borrowCode = strtoupper('BRW-TST-' . now()->format('Ymd') . '-' . Str::random(5));

        $borrow = Borrow::create([
            'user_id'     => $user->id,
            'borrow_code' => $borrowCode,
            'borrow_date' => $data['borrow_date'],
            'return_date' => $data['return_date'],
            'status'      => $data['status'],
        ]);

        // Generate QR code
        Storage::disk('public')->makeDirectory('qr_codes');
        $filename     = 'borrow_' . $borrow->id . '_' . $borrowCode . '.svg';
        $relativePath = 'qr_codes/' . $filename;
        $absolutePath = storage_path('app/public/' . $relativePath);
        QrCode::format('svg')->size(300)->errorCorrection('H')->generate($borrowCode, $absolutePath);
        $borrow->update(['qr_code_path' => $relativePath]);

        BorrowDetail::create([
            'borrow_id'   => $borrow->id,
            'book_copy_id' => $copy->id,
            'status'      => $data['status'] === 'close' ? 'returned' : 'borrowed',
        ]);

        if ($data['status'] === 'open') {
            $copy->update(['status' => 'borrowed']);
        }

        return $borrow;
    }
}
