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
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('full_name');
            $table->string('username')->nullable()->unique();
            $table->enum('gender', ['male', 'female', 'prefer_not_to_say', 'croissant'])->nullable();
            $table->date('birth_date')->nullable();

            $table->string('avatar')->nullable();
            $table->string('phone_number')->nullable();
            $table->text('address')->nullable();
            $table->text('bio')->nullable();

            $table->string('identification_number')->nullable()->unique();
            $table->enum('occupation', ['student', 'teacher', 'staff', 'external', 'other'])->nullable();
            $table->string('institution')->nullable();
            $table->boolean('notification_enabled')->default(false);
            $table->boolean('notification_email')->default(false);
            $table->boolean('notification_whatsapp')->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
