<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('membership_transactions', function (Blueprint $table) {
            $table->string('va_number')->nullable()->after('payment_type');
            $table->string('bank')->nullable()->after('va_number');
            $table->json('payment_payload')->nullable()->after('midtrans_payload');
        });

        Schema::table('fine_borrows', function (Blueprint $table) {
            $table->string('va_number')->nullable()->after('snap_token');
            $table->string('bank')->nullable()->after('va_number');
            $table->json('payment_payload')->nullable()->after('bank');
        });
    }

    public function down(): void
    {
        Schema::table('membership_transactions', function (Blueprint $table) {
            $table->dropColumn(['va_number', 'bank', 'payment_payload']);
        });

        Schema::table('fine_borrows', function (Blueprint $table) {
            $table->dropColumn(['va_number', 'bank', 'payment_payload']);
        });
    }
};
