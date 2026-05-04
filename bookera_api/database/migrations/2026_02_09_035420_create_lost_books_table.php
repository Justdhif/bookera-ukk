<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lost_books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('borrow_id')->constrained('borrows')->cascadeOnDelete();
            $table->foreignId('book_copy_id')->constrained('book_copies')->cascadeOnDelete();
            $table->date('lost_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lost_books');
    }
};
