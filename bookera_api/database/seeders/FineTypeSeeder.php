<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FineTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fineTypes = [
            [
                'name' => 'Denda Buku Hilang',
                'type' => 'lost',
                'amount' => 50000.00,
                'description' => 'Denda dikenakan apabila buku dinyatakan hilang oleh peminjam.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Denda Buku Rusak',
                'type' => 'damaged',
                'amount' => 20000.00,
                'description' => 'Denda dikenakan apabila buku dikembalikan dalam kondisi rusak.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Denda Keterlambatan',
                'type' => 'late',
                'amount' => 2000.00,
                'description' => 'Denda harian yang dikenakan apabila buku dikembalikan melewati batas waktu.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('fine_types')->insert($fineTypes);
    }
}
