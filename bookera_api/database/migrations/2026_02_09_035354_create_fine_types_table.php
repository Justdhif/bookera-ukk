<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fine_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['lost', 'damaged', 'late']);
            $table->decimal('amount', 10, 2);
            $table->decimal('percentage', 5, 2)->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fine_types');
    }
};
