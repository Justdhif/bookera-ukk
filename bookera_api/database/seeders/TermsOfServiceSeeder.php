<?php

namespace Database\Seeders;

use App\Models\TermsOfService;
use Illuminate\Database\Seeder;

class TermsOfServiceSeeder extends Seeder
{
    public function run(): void
    {
        if ($this->command->confirm('Apakah Anda ingin membuat data Syarat dan Ketentuan?', true)) {
            TermsOfService::factory()->create();
            $this->command->info('✅ Berhasil membuat data Syarat dan Ketentuan.');
        } else {
            $this->command->info('⏭️ Melewati pembuatan Syarat dan Ketentuan.');
        }
    }
}
