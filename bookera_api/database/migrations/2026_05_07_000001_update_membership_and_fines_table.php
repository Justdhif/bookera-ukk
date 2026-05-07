<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('memberships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('membership_plan_id')->constrained()->cascadeOnDelete();
            $table->string('member_code')->unique();
            $table->text('qr_code')->nullable();
            $table->timestamp('joined_at');
            $table->timestamp('expires_at')->nullable();
            $table->enum('status', ['active', 'expired', 'cancelled'])->default('active');
            $table->timestamps();
        });

        Schema::table('membership_plans', function (Blueprint $table) {
            $table->integer('damaged_fine_discount')->default(0)->after('description');
            $table->integer('lost_fine_discount')->default(0)->after('damaged_fine_discount');
        });

        Schema::table('fine_borrows', function (Blueprint $table) {
            $table->string('payment_method')->nullable()->after('status');
            $table->string('order_id')->nullable()->unique()->after('payment_method');
            $table->string('snap_token')->nullable()->after('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('memberships');

        Schema::table('membership_plans', function (Blueprint $table) {
            $table->dropColumn(['damaged_fine_discount', 'lost_fine_discount']);
        });

        Schema::table('fine_borrows', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'order_id', 'snap_token']);
        });
    }
};
