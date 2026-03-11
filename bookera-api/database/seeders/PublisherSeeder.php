<?php

namespace Database\Seeders;

use App\Models\Publisher;
use Illuminate\Database\Seeder;

class PublisherSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a diverse set of publishers
        Publisher::factory(10)->active()->create();

        // A few inactive publishers
        Publisher::factory(2)->inactive()->create();
    }
}
