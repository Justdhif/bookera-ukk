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
        Schema::dropIfExists('student_details');
        Schema::dropIfExists('teacher_details');
        Schema::dropIfExists('staff_details');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate student_details table
        Schema::create('student_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('student_number')->unique();
            $table->string('class')->nullable();
            $table->string('major')->nullable();
            $table->year('enrollment_year')->nullable();
            $table->timestamps();
        });

        // Recreate teacher_details table
        Schema::create('teacher_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('employee_number')->unique();
            $table->string('subject')->nullable();
            $table->timestamps();
        });

        // Recreate staff_details table
        Schema::create('staff_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained()
                  ->cascadeOnDelete();

            $table->string('staff_number')->unique();
            $table->string('position');
            $table->string('department')->nullable();
            $table->timestamps();
        });
    }
};
