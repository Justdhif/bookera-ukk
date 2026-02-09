<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update status enum to include all required statuses
        DB::statement("ALTER TABLE loans MODIFY COLUMN status ENUM('pending', 'waiting', 'borrowed', 'checking', 'returned', 'rejected', 'late', 'lost') NOT NULL DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original status enum
        DB::statement("ALTER TABLE loans MODIFY COLUMN status ENUM('borrowed', 'returned', 'late') NOT NULL DEFAULT 'borrowed'");
    }
};
