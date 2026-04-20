<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class FineTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        DB::table('fine_types')->truncate();
        Schema::enableForeignKeyConstraints();

        $fineTypes = [
            [
                'name' => 'Denda Keterlambatan',
                'type' => 'late',
                'amount' => 1000.00,
                'description' => 'Denda keterlambatan pengembalian buku per hari.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Denda Buku Rusak Ringan',
                'type' => 'damaged',
                'amount' => 10000.00,
                'description' => 'Denda untuk kerusakan ringan pada buku.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Denda Buku Rusak Sedang',
                'type' => 'damaged',
                'amount' => 25000.00,
                'description' => 'Denda untuk kerusakan sedang pada buku.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Denda Buku Rusak Berat',
                'type' => 'damaged',
                'amount' => 50000.00,
                'description' => 'Denda untuk kerusakan berat pada buku.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Denda Buku Hilang',
                'type' => 'lost',
                'amount' => 0.00,
                'description' => 'Denda untuk buku yang hilang (sesuai harga buku).',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('fine_types')->insert($fineTypes);
    }
}
