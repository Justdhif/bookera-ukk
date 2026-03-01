<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Borrow;
use App\Models\BorrowDetail;
use App\Models\BookCopy;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class BorrowSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::where('role', 'user')->get();

        if ($users->isEmpty()) {
            $this->command->warn('No users found. Please run UserSeeder first.');
            return;
        }

        $bookCopies = BookCopy::whereIn('status', ['borrowed', 'available'])->get();

        if ($bookCopies->isEmpty()) {
            $this->command->warn('No book copies found. Please run BookCopySeeder first.');
            return;
        }

        $borrows = [
            [
                'borrow_date'  => Carbon::now()->subDays(10),
                'return_date'  => Carbon::now()->subDays(3),
                'status'       => 'close',
                'approval_status' => 'approved',
            ],
            [
                'borrow_date'  => Carbon::now()->subDays(8),
                'return_date'  => Carbon::now()->subDays(1),
                'status'       => 'close',
                'approval_status' => 'approved',
            ],
            [
                'borrow_date'  => Carbon::now()->subDays(7),
                'return_date'  => Carbon::now()->addDays(7),
                'status'       => 'open',
                'approval_status' => 'approved',
            ],
            [
                'borrow_date'  => Carbon::now()->subDays(6),
                'return_date'  => Carbon::now()->addDays(8),
                'status'       => 'open',
                'approval_status' => 'approved',
            ],
            [
                'borrow_date'  => Carbon::now()->subDays(5),
                'return_date'  => Carbon::now()->addDays(9),
                'status'       => 'open',
                'approval_status' => 'approved',
            ],
            [
                'borrow_date'  => Carbon::now()->subDays(4),
                'return_date'  => Carbon::now()->addDays(10),
                'status'       => 'open',
                'approval_status' => 'pending',
            ],
            [
                'borrow_date'  => Carbon::now()->subDays(15),
                'return_date'  => Carbon::now()->subDays(8),
                'status'       => 'close',
                'approval_status' => 'approved',
            ],
            [
                'borrow_date'  => Carbon::now()->subDays(3),
                'return_date'  => Carbon::now()->addDays(11),
                'status'       => 'open',
                'approval_status' => 'approved',
            ],
            [
                'borrow_date'  => Carbon::now()->subDays(2),
                'return_date'  => Carbon::now()->addDays(12),
                'status'       => 'open',
                'approval_status' => 'pending',
            ],
            [
                'borrow_date'  => Carbon::now()->subDays(1),
                'return_date'  => Carbon::now()->addDays(13),
                'status'       => 'open',
                'approval_status' => 'approved',
            ],
            [
                'borrow_date'  => Carbon::now()->subDays(12),
                'return_date'  => Carbon::now()->subDays(5),
                'status'       => 'close',
                'approval_status' => 'approved',
            ],
            [
                'borrow_date'  => Carbon::now()->subDays(20),
                'return_date'  => Carbon::now()->subDays(13),
                'status'       => 'close',
                'approval_status' => 'approved',
            ],
        ];

        $copyIndex = 0;
        foreach ($borrows as $borrowData) {
            if ($copyIndex >= $bookCopies->count()) {
                break;
            }

            $user     = $users->random();
            $bookCopy = $bookCopies[$copyIndex];

            $borrowCode = strtoupper('BRW-' . now()->format('Ymd') . '-' . Str::random(6));

            $borrow = Borrow::create([
                'user_id'     => $user->id,
                'borrow_code' => $borrowCode,
                'borrow_date' => $borrowData['borrow_date'],
                'return_date' => $borrowData['return_date'],
                'status'      => $borrowData['status'],
            ]);

            // Generate & save QR code SVG
            Storage::disk('public')->makeDirectory('qr_codes');
            $filename     = 'borrow_' . $borrow->id . '_' . $borrowCode . '.svg';
            $relativePath = 'qr_codes/' . $filename;
            $absolutePath = storage_path('app/public/' . $relativePath);
            QrCode::format('svg')->size(300)->errorCorrection('H')->generate($borrowCode, $absolutePath);
            $borrow->update(['qr_code_path' => $relativePath]);

            BorrowDetail::create([
                'borrow_id'       => $borrow->id,
                'book_copy_id'    => $bookCopy->id,
                'approval_status' => $borrowData['approval_status'],
                'status'          => $borrowData['status'] === 'close' ? 'returned' : 'borrowed',
            ]);

            if ($borrowData['status'] === 'open') {
                $bookCopy->update(['status' => 'borrowed']);
            }

            $copyIndex++;
        }
    }
}
