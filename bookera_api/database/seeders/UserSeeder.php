<?php

namespace Database\Seeders;

use App\Enums\UserOccupation;
use App\Helpers\AvatarHelper;
use App\Models\User;
use App\Models\UserProfile;
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
            $this->createCustomUser(
                email: 'noob1234five@gmail.com',
                slug: 'noob1234five',
                role: 'admin',
                fullName: 'Noob1234 Five',
                gender: 'male',
                phoneNumber: '6282113285557',
                address: 'Jl. Bookera No. 1, Jakarta',
                bio: 'Akun staff/admin khusus untuk pengujian Bookera.',
                identificationPrefix: 'NB',
                occupation: UserOccupation::Staff,
                institution: 'Bookera Academy',
            );

            $this->createCustomUser(
                email: 'justdhif418@gmail.com',
                slug: 'justdhif418',
                role: 'user',
                fullName: 'Just Dhif 418',
                gender: 'male',
                phoneNumber: '628123456788',
                address: 'Jl. Bookera No. 2, Bandung',
                bio: 'Akun user eksternal khusus untuk pengujian Bookera.',
                identificationPrefix: 'JD',
                occupation: UserOccupation::External,
                institution: 'Bookera Community',
            );

            $this->createCustomUser(
                email: 'member@gmail.com',
                slug: 'member-test',
                role: 'member',
                fullName: 'Member Tester',
                gender: 'female',
                phoneNumber: '628123456789',
                address: 'Jl. Bookera No. 3, Yogyakarta',
                bio: 'Akun member khusus untuk pengujian fitur reservasi dan WhatsApp.',
                identificationPrefix: 'MB',
                occupation: UserOccupation::Student,
                institution: 'Bookera Academy',
            );

            if ($count > 0) {
                User::factory($count)->create();
            }

            $this->ensureProfilesExist();

            UserProfile::query()->update([
                'notification_enabled' => true,
                'notification_email' => true,
                'notification_whatsapp' => true,
            ]);

            $this->command->info("✅ Berhasil membuat " . ($count + 2) . " data User (termasuk 2 User Khusus).");
        });
    }

    private function createCustomUser(
        string $email,
        string $slug,
        string $role,
        string $fullName,
        string $gender,
        string $phoneNumber,
        string $address,
        string $bio,
        string $identificationPrefix,
        UserOccupation $occupation,
        string $institution,
    ): void {
        $user = User::query()->firstOrNew(['email' => $email]);

        $user->forceFill([
            'slug' => Str::slug($slug),
            'password' => Hash::make('password'),
            'role' => $role,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $user->save();

        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'full_name' => $fullName,
                'gender' => $gender,
                'phone_number' => $phoneNumber,
                'address' => $address,
                'bio' => $bio,
                'identification_number' => $identificationPrefix.'-'.str_pad($user->id, 4, '0', STR_PAD_LEFT),
                'occupation' => $occupation->value,
                'institution' => $institution,
                'avatar' => AvatarHelper::generateDefaultAvatar($user->id),
                'notification_enabled' => true,
                'notification_email' => true,
                'notification_whatsapp' => true,
            ]
        );
    }

    private function ensureProfilesExist(): void
    {
        User::doesntHave('profile')->get()->each(function (User $user): void {
            $user->profile()->create([
                'full_name' => Str::headline(Str::before($user->email, '@')),
                'gender' => 'prefer_not_to_say',
                'phone_number' => '628'.str_pad((string) $user->id, 9, '0', STR_PAD_LEFT),
                'address' => 'Jl. Bookera',
                'bio' => 'Akun Bookera.',
                'identification_number' => 'UP-'.str_pad((string) $user->id, 4, '0', STR_PAD_LEFT),
                'occupation' => UserOccupation::Other->value,
                'institution' => 'Bookera',
                'avatar' => AvatarHelper::generateDefaultAvatar($user->id),
                'notification_enabled' => true,
                'notification_email' => true,
                'notification_whatsapp' => true,
            ]);
        });
    }
}
