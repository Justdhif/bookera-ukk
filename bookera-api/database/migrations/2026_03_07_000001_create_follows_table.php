<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('follows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->morphs('followable'); // followable_id, followable_type
            $table->timestamps();

            $table->unique(['user_id', 'followable_id', 'followable_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('follows');
    }
};
