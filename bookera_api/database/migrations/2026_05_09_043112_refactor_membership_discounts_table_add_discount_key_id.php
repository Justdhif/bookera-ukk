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
        Schema::table('membership_discounts', function (Blueprint $table) {
            $table->foreignId('discount_key_id')->after('id')->nullable()->constrained('discount_keys')->onDelete('cascade');
        });

        // Migrate existing data
        $discounts = DB::table('membership_discounts')->get();
        foreach ($discounts as $discount) {
            $discountKeyId = DB::table('discount_keys')->insertGetId([
                'key' => $discount->discount_key,
                'name' => $discount->name,
                'description' => $discount->description,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('membership_discounts')
                ->where('id', $discount->id)
                ->update(['discount_key_id' => $discountKeyId]);
        }

        Schema::table('membership_discounts', function (Blueprint $table) {
            $table->foreignId('discount_key_id')->nullable(false)->change();
            $table->dropColumn(['discount_key', 'name', 'description']);
        });
    }

    public function down(): void
    {
        Schema::table('membership_discounts', function (Blueprint $table) {
            $table->string('discount_key')->after('discount_key_id');
            $table->string('name')->after('discount_key');
            $table->text('description')->nullable()->after('name');
        });

        // Migrate back
        $discounts = DB::table('membership_discounts')->get();
        foreach ($discounts as $discount) {
            $discountKey = DB::table('discount_keys')->where('id', $discount->discount_key_id)->first();
            if ($discountKey) {
                DB::table('membership_discounts')
                    ->where('id', $discount->id)
                    ->update([
                        'discount_key' => $discountKey->key,
                        'name' => $discountKey->name,
                        'description' => $discountKey->description,
                    ]);
            }
        }

        Schema::table('membership_discounts', function (Blueprint $table) {
            $table->dropForeign(['discount_key_id']);
            $table->dropColumn('discount_key_id');
        });
    }
};
