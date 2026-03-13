<?php

namespace Database\Factories;

use App\Helpers\AvatarHelper;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    protected static ?string $password;

    public function definition(): array
    {
        return [
            'email'             => fake()->unique()->safeEmail(),
            'slug'              => Str::slug(fake()->unique()->userName()),
            'password'          => static::$password ??= Hash::make('password'),
            'role'              => fake()->randomElement(['admin', 'officer:catalog', 'officer:management', 'user']),
            'is_active'         => true,
            'email_verified_at' => now(),
        ];
    }

    public function admin(): static
    {
        return $this->state(['role' => 'admin']);
    }

    public function officerCatalog(): static
    {
        return $this->state(['role' => 'officer:catalog']);
    }

    public function officerManagement(): static
    {
        return $this->state(['role' => 'officer:management']);
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }

    public function unverified(): static
    {
        return $this->state(['email_verified_at' => null]);
    }

    public function configure(): static
    {
        return $this->afterCreating(function (User $user) {
            $user->profile()->create([
                'full_name'             => fake()->name(),
                'gender'                => fake()->randomElement(['male', 'female', 'prefer_not_to_say']),
                'phone_number'          => fake()->unique()->numerify('08##########'),
                'address'               => fake()->address(),
                'bio'                   => fake()->optional(0.7)->sentence(),
                'identification_number' => strtoupper(fake()->unique()->bothify('??-####')),
                'occupation'            => fake()->randomElement(['Student', 'Teacher', 'Staff', 'Public', 'Other']),
                'institution'           => fake()->company(),
                'avatar'                => AvatarHelper::generateDefaultAvatar($user->id),
            ]);
        });
    }
}
