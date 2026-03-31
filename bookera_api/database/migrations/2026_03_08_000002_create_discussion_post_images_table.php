<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('discussion_post_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('discussion_posts')->cascadeOnDelete();
            $table->string('image_path');
            $table->unsignedTinyInteger('order')->default(0);
            $table->timestamps();

            $table->index(['post_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discussion_post_images');
    }
};
