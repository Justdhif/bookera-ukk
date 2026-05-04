<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_plans', function (Blueprint $table) {
            $table->id();
            $table->string('plan_id')->unique();
            $table->string('name');
            $table->unsignedBigInteger('price');
            $table->string('description');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_plans');
    }
};
