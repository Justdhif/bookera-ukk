<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('borrows', function (Blueprint $table) {
            $table->foreignId('borrow_request_id')
                ->nullable()
                ->after('user_id')
                ->constrained('borrow_requests')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('borrows', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\BorrowRequest::class);
        });
    }
};
