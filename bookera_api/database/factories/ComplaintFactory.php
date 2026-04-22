<?php

namespace Database\Factories;

use App\Models\Complaint;
use App\Models\User;
use App\Helpers\SlugGenerator;
use Illuminate\Database\Eloquent\Factories\Factory;

class ComplaintFactory extends Factory
{
    protected $model = Complaint::class;

    public function definition(): array
    {
        $title = $this->faker->sentence(4);
        return [
            'user_id'     => User::inRandomOrder()->first()->id ?? User::factory(),
            'title'       => $title,
            'description' => $this->faker->paragraph(3),
            'category'    => $this->faker->randomElement(['website', 'facility', 'service', 'other']),
            'status'      => $this->faker->randomElement(['pending', 'verified', 'on_progress', 'resolved', 'rejected']),
            'slug'        => SlugGenerator::generate('complaints', 'slug', $title),
            'resolved_at' => null,
        ];
    }
}
