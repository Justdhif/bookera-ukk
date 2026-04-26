<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('borrow_request_details', function (Blueprint $table) {
            $table->enum('approval_status', ['processing', 'approved', 'rejected'])
                ->default('processing')
                ->after('book_id');
            $table->text('reject_reason')->nullable()->after('approval_status');
            $table->foreignId('book_copy_id')
                ->nullable()
                ->after('reject_reason')
                ->constrained('book_copies')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('borrow_request_details', function (Blueprint $table) {
            $table->dropConstrainedForeignId('book_copy_id');
            $table->dropColumn(['approval_status', 'reject_reason']);
        });
    }
};
