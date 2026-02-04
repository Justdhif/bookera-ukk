<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Helpers\AvatarHelper;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {

            $admin = User::create([
                'email' => 'admin@school.test',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'is_active' => true,
            ]);

            $admin->profile()->create([
                'full_name' => 'System Administrator',
                'gender' => 'male',
                'phone_number' => '0811111111',
                'address' => 'School Office',
                'bio' => 'System administrator managing the library system',
                'identification_number' => 'ADM-001',
                'occupation' => 'Administrator',
                'institution' => 'School Administration',
                'avatar' => AvatarHelper::generateDefaultAvatar($admin->id),
            ]);

            $officer = User::create([
                'email' => 'officer@school.test',
                'password' => Hash::make('password'),
                'role' => 'officer',
                'is_active' => true,
            ]);

            $officer->profile()->create([
                'full_name' => 'Library Officer',
                'gender' => 'female',
                'phone_number' => '0822222222',
                'address' => 'Library Office',
                'bio' => 'Library officer managing book loans and returns',
                'identification_number' => 'LIB-001',
                'occupation' => 'Librarian',
                'institution' => 'School Library',
                'avatar' => AvatarHelper::generateDefaultAvatar($officer->id),
            ]);

            $student = User::create([
                'email' => 'student@school.test',
                'password' => Hash::make('password'),
                'role' => 'user',
                'is_active' => true,
            ]);

            $student->profile()->create([
                'full_name' => 'John Student',
                'gender' => 'male',
                'phone_number' => '0833333333',
                'address' => 'Student Dormitory',
                'bio' => 'Student member of the library',
                'identification_number' => 'SIS-001',
                'occupation' => 'Student',
                'institution' => 'XI RPL 1 - Software Engineering',
                'avatar' => AvatarHelper::generateDefaultAvatar($student->id),
            ]);

            $teacher = User::create([
                'email' => 'teacher@school.test',
                'password' => Hash::make('password'),
                'role' => 'user',
                'is_active' => true,
            ]);

            $teacher->profile()->create([
                'full_name' => 'Jane Teacher',
                'gender' => 'female',
                'phone_number' => '0844444444',
                'address' => 'Teacher Housing',
                'bio' => 'Mathematics teacher',
                'identification_number' => 'TCH-001',
                'occupation' => 'Teacher',
                'institution' => 'Mathematics Department',
                'avatar' => AvatarHelper::generateDefaultAvatar($teacher->id),
            ]);

            $member = User::create([
                'email' => 'member@school.test',
                'password' => Hash::make('password'),
                'role' => 'user',
                'is_active' => true,
            ]);

            $member->profile()->create([
                'full_name' => 'General Member',
                'gender' => 'prefer_not_to_say',
                'phone_number' => '0855555555',
                'address' => 'General Address',
                'bio' => 'General library member',
                'identification_number' => 'MEM-001',
                'occupation' => 'Public',
                'institution' => 'General Public',
                'avatar' => AvatarHelper::generateDefaultAvatar($member->id),
            ]);
        });
    }
}
