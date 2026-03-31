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
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->boolean('notification_enabled')->default(false)->after('institution');
            $table->boolean('notification_email')->default(false)->after('notification_enabled');
            $table->boolean('notification_whatsapp')->default(false)->after('notification_email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->dropColumn(['notification_enabled', 'notification_email', 'notification_whatsapp']);
        });
    }
};
