<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('loan_details', function (Blueprint $table) {
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])
                  ->default('pending')
                  ->after('book_copy_id');
            $table->text('note')->nullable()->after('approval_status');
        });

        Schema::table('loans', function (Blueprint $table) {
            $table->dropColumn('approval_status');
        });
    }

    public function down(): void
    {
        Schema::table('loans', function (Blueprint $table) {
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])
                  ->default('pending')
                  ->after('status');
        });

        Schema::table('loan_details', function (Blueprint $table) {
            $table->dropColumn(['approval_status', 'note']);
        });
    }
};
