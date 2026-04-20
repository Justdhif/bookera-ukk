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
        Schema::table('books', function (Blueprint $table) {
            $table->decimal('price', 15, 2)->after('cover_image')->default(0);
        });

        Schema::rename('fines', 'fine_borrows');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::rename('fine_borrows', 'fines');

        Schema::table('books', function (Blueprint $table) {
            $table->dropColumn('price');
        });
    }
};
