<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserProfile;
use App\Helpers\AvatarHelper;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $count = (int) $this->command->ask('Berapa banyak User yang ingin dibuat?', 10);

        DB::transaction(function () use ($count) {
            $userCreated = false;
            if (!User::where('email', 'noob1234five@gmail.com')->exists()) {
                User::factory()->admin()->create([
                    'email' => 'noob1234five@gmail.com',
                    'slug' => 'noob1234five',
                ]);
            }

            if (!User::where('email', 'user@bookera.com')->exists()) {
                $user = new User();
                $user->email = 'user@bookera.com';
                $user->password = Hash::make('password');
                $user->role = 'user';
                $user->is_active = true;
                $user->slug = 'john-doe';
                $user->save();
                $userCreated = true;

                UserProfile::create([
                    'user_id' => $user->id,
                    'full_name' => 'John Doe',
                    'gender' => 'male',
                    'phone_number' => '081234567890',
                    'address' => 'Jl. Bookera No. 1, Jakarta',
                    'bio' => 'Halo, saya adalah user khusus untuk pengujian.',
                    'identification_number' => 'JD-' . str_pad($user->id, 4, '0', STR_PAD_LEFT),
                    'occupation' => 'Student',
                    'institution' => 'Bookera Academy',
                    'avatar' => AvatarHelper::generateDefaultAvatar($user->id),
                ]);
            }

            if ($count > 0) {
                User::factory($count)->create();
            }

            $this->command->info("✅ Berhasil membuat " . ($userCreated ? $count + 1 : $count) . " data User (termasuk 1 User Khusus).");
        });
    }
}
