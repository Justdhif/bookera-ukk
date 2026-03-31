<?php

namespace Database\Seeders;

use App\Models\PrivacyPolicy;
use Illuminate\Database\Seeder;

class PrivacyPolicySeeder extends Seeder
{
    public function run(): void
    {
        if ($this->command->confirm('Apakah Anda ingin membuat data Kebijakan Privasi?', true)) {
            PrivacyPolicy::factory()->create();
            $this->command->info('✅ Berhasil membuat data Kebijakan Privasi.');
        } else {
            $this->command->info('⏭️ Melewati pembuatan Kebijakan Privasi.');
        }
    }
}
