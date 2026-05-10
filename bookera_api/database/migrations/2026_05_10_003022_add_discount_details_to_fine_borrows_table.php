<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('fine_borrows', function (Blueprint $table) {
            $table->decimal('original_amount', 10, 2)->after('amount')->nullable();
            $table->integer('discount_percentage')->after('original_amount')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fine_borrows', function (Blueprint $table) {
            $table->dropColumn(['original_amount', 'discount_percentage']);
        });
    }
};
