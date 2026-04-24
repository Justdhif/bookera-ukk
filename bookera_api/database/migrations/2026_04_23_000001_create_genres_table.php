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
        Schema::create('genres', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name')->unique();
            $table->string('icon')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('book_genres', function (Blueprint $table) {
            $table->foreignId('genre_id')->constrained()->cascadeOnDelete();
            $table->foreignId('book_id')->constrained()->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('book_genres');
        Schema::dropIfExists('genres');
    }
};
