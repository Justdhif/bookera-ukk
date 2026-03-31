<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('discussion_posts', function (Blueprint $table) {
            $table->timestamp('taken_down_at')->nullable()->after('comments_count');
            $table->string('taken_down_reason')->nullable()->after('taken_down_at');
        });
    }

    public function down(): void
    {
        Schema::table('discussion_posts', function (Blueprint $table) {
            $table->dropColumn(['taken_down_at', 'taken_down_reason']);
        });
    }
};
