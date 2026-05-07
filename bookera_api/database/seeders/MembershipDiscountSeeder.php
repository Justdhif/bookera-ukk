<?php

namespace Database\Seeders;

use App\Models\MembershipDiscount;
use Illuminate\Database\Seeder;

class MembershipDiscountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $discounts = [
            [
                'discount_key' => 'fine_damaged',
                'name' => 'Diskon Denda Rusak',
                'discount_percentage' => 15,
                'description' => 'Diskon otomatis sebesar 15% untuk denda buku yang dikembalikan dalam keadaan rusak bagi pemegang membership aktif.'
            ],
            [
                'discount_key' => 'fine_lost',
                'name' => 'Diskon Denda Hilang',
                'discount_percentage' => 10,
                'description' => 'Diskon otomatis sebesar 10% untuk denda buku yang hilang bagi pemegang membership aktif.'
            ],
            [
                'discount_key' => 'service_fee',
                'name' => 'Diskon Biaya Layanan',
                'discount_percentage' => 100,
                'description' => 'Gratis biaya layanan tambahan untuk seluruh member aktif.'
            ]
        ];

        foreach ($discounts as $discount) {
            MembershipDiscount::updateOrCreate(
                ['discount_key' => $discount['discount_key']],
                [
                    'name' => $discount['name'],
                    'discount_percentage' => $discount['discount_percentage'],
                    'description' => $discount['description'],
                ]
            );
        }

        $this->command->info('✅ Berhasil menyemai data diskon membership global.');
    }
}
