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
        Schema::create('borrows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('borrow_code')->unique();
            $table->string('qr_code_path')->nullable();
            $table->date('borrow_date');
            $table->date('return_date');
            $table->enum('status', ['open', 'close'])->default('open');
            $table->enum('approval_status', ['pending', 'approved', 'rejected', 'partial'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('borrows');
    }
};
