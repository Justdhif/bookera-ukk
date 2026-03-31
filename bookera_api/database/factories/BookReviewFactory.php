<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\BookReview;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BookReviewFactory extends Factory
{
    protected $model = BookReview::class;

    public function definition(): array
    {
        $reviews = [
            "Buku ini sungguh luar biasa, sangat menginspirasi!",
            "Sangat direkomendasikan untuk dibaca saat waktu luang.",
            "Ceritanya cukup bagus, tapi alurnya sedikit lambat di pertengahan.",
            "Tidak sesuai dengan ekspektasi saya, tapi masih bisa dinikmati.",
            "Karya masterpiece yang wajib dibaca oleh semua orang.",
            "Penulis berhasil membawa pembaca masuk ke dalam cerita.",
            "Sangat informatif dan membuka wawasan baru.",
            "Bahasa yang digunakan mudah dipahami.",
            "Karakter utamanya sangat kuat dan relevan.",
            "Buku ini membuat saya tidak bisa berhenti membaca sampai akhir."
        ];

        return [
            'user_id' => User::factory(),
            'book_id' => Book::factory(),
            'rating' => $this->faker->numberBetween(3, 5),
            'review' => $this->faker->boolean(70) ? $this->faker->randomElement($reviews) : null,
        ];
    }
}
