<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create membership_discounts table
        Schema::create('membership_discounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('membership_plan_id')->constrained()->cascadeOnDelete();
            $table->string('fine_type'); // lost, damaged, late
            $table->integer('discount_percentage')->default(0);
            $table->timestamps();
        });

        // 2. Remove discount columns from membership_plans (the ones I added earlier)
        Schema::table('membership_plans', function (Blueprint $table) {
            if (Schema::hasColumn('membership_plans', 'damaged_fine_discount')) {
                $table->dropColumn(['damaged_fine_discount', 'lost_fine_discount']);
            }
        });

        // 3. Update memberships table to include qr_code_path
        Schema::table('memberships', function (Blueprint $table) {
            if (!Schema::hasColumn('memberships', 'qr_code_path')) {
                $table->string('qr_code_path')->nullable()->after('member_code');
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_discounts');

        Schema::table('membership_plans', function (Blueprint $table) {
            $table->integer('damaged_fine_discount')->default(0);
            $table->integer('lost_fine_discount')->default(0);
        });

        Schema::table('memberships', function (Blueprint $table) {
            $table->dropColumn('qr_code_path');
        });
    }
};
