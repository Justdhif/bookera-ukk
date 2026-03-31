<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('discussion_post_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('post_id')->constrained('discussion_posts')->cascadeOnDelete();
            $table->enum('reason', [
                'spam',
                'harassment',
                'hate_speech',
                'misinformation',
                'inappropriate_content',
                'other',
            ]);
            $table->text('description')->nullable();
            $table->enum('status', ['pending', 'reviewed', 'dismissed'])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('admin_note')->nullable();
            $table->timestamps();

            // One user can only report a post once
            $table->unique(['reporter_id', 'post_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discussion_post_reports');
    }
};
