<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop the old table first
        Schema::dropIfExists('membership_discounts');

        // Create the new global membership_discounts table
        Schema::create('membership_discounts', function (Blueprint $table) {
            $table->id();
            $table->string('discount_key')->unique(); // e.g., 'fine_damaged', 'fine_lost', 'service_fee'
            $table->string('name'); // Display name e.g., 'Diskon Denda Rusak'
            $table->integer('discount_percentage')->default(0);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_discounts');
        
        // Recreate the old one for rollback
        Schema::create('membership_discounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('membership_plan_id')->constrained()->cascadeOnDelete();
            $table->string('fine_type');
            $table->integer('discount_percentage')->default(0);
            $table->timestamps();
        });
    }
};
