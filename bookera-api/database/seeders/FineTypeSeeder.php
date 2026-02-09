<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\FineType;

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
                'amount' => 100000.00,
                'description' => 'Denda untuk buku yang hilang atau tidak dikembalikan',
            ],
            [
                'name' => 'Denda Buku Rusak Ringan',
                'type' => 'damaged',
                'amount' => 25000.00,
                'description' => 'Denda untuk buku yang rusak ringan (halaman robek, corat-coret)',
            ],
            [
                'name' => 'Denda Buku Rusak Berat',
                'type' => 'damaged',
                'amount' => 50000.00,
                'description' => 'Denda untuk buku yang rusak berat (cover hilang, halaman lepas)',
            ],
            [
                'name' => 'Denda Keterlambatan (per hari)',
                'type' => 'late',
                'amount' => 2000.00,
                'description' => 'Denda keterlambatan pengembalian buku per hari',
            ],
        ];

        foreach ($fineTypes as $fineType) {
            FineType::create($fineType);
        }
    }
}
