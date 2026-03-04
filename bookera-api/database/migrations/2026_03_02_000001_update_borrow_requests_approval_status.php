<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('borrow_requests', function (Blueprint $table) {
            // Remove request code and QR code fields
            $table->dropColumn(['request_code', 'qr_code_path']);

            // Add approval status and reject reason
            $table->enum('approval_status', ['processing', 'canceled', 'approved', 'rejected'])
                ->default('processing')
                ->after('return_date');
            $table->text('reject_reason')->nullable()->after('approval_status');
        });
    }

    public function down(): void
    {
        Schema::table('borrow_requests', function (Blueprint $table) {
            $table->dropColumn(['approval_status', 'reject_reason']);
            $table->string('request_code')->unique()->after('id');
            $table->string('qr_code_path')->nullable()->after('request_code');
        });
    }
};
