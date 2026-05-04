<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('book_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['waiting', 'notified', 'fulfilled', 'cancelled'])->default('waiting');
            $table->unsignedInteger('queue_position')->default(1);
            $table->timestamp('notified_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'book_id']);
            $table->index(['book_id', 'status', 'queue_position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
