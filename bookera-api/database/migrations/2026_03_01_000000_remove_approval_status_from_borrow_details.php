<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('borrow_details', 'approval_status')) {
            Schema::table('borrow_details', function (Blueprint $table) {
                $table->dropColumn('approval_status');
            });
        }

        if (Schema::hasColumn('borrows', 'approval_status')) {
            Schema::table('borrows', function (Blueprint $table) {
                $table->dropColumn('approval_status');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('borrows', 'approval_status')) {
            Schema::table('borrows', function (Blueprint $table) {
                $table->enum('approval_status', ['pending', 'approved', 'rejected', 'partial'])
                    ->default('pending')
                    ->after('status');
            });
        }

        if (! Schema::hasColumn('borrow_details', 'approval_status')) {
            Schema::table('borrow_details', function (Blueprint $table) {
                $table->enum('approval_status', ['pending', 'approved', 'rejected'])
                    ->default('pending')
                    ->after('status');
            });
        }
    }
};
