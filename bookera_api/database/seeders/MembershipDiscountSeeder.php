<?php
 
 namespace Database\Seeders;
 
 use App\Models\MembershipDiscount;
 use App\Models\DiscountKey;
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
                 'key' => 'fine_damaged',
                 'name' => 'Diskon Denda Rusak',
                 'discount_percentage' => 10,
                 'description' => 'Diskon otomatis sebesar 10% untuk denda buku yang dikembalikan dalam keadaan rusak bagi pemegang membership aktif.'
             ],
             [
                 'key' => 'fine_lost',
                 'name' => 'Diskon Denda Hilang',
                 'discount_percentage' => 20,
                 'description' => 'Diskon otomatis sebesar 20% untuk denda buku yang hilang bagi pemegang membership aktif.'
             ],
             [
                 'key' => 'fine_late',
                 'name' => 'Diskon Denda Keterlambatan',
                 'discount_percentage' => 0,
                 'description' => 'Diskon denda keterlambatan (Default: 0% karena denda telat tidak mendapatkan potongan).'
             ],
             [
                 'key' => 'service_fee',
                 'name' => 'Diskon Biaya Layanan',
                 'discount_percentage' => 100,
                 'description' => 'Gratis biaya layanan tambahan untuk seluruh member aktif.'
             ]
         ];
 
         foreach ($discounts as $data) {
             $discountKey = DiscountKey::updateOrCreate(
                 ['key' => $data['key']],
                 [
                     'name' => $data['name'],
                     'description' => $data['description'],
                 ]
             );
 
             MembershipDiscount::updateOrCreate(
                 ['discount_key_id' => $discountKey->id],
                 [
                     'discount_percentage' => $data['discount_percentage'],
                 ]
             );
         }
 
         $this->command->info('✅ Berhasil menyemai data diskon membership global.');
     }
 }
