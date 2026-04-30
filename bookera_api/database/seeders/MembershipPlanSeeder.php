<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MembershipPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('membership_plans')->insert([
            'plan_id' => 'lifetime',
            'name' => 'Lifetime Member',
            'price' => 150000,
            'description' => 'Akses seluruh fitur premium selamanya tanpa batas.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
