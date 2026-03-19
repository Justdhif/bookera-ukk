<?php

namespace Database\Seeders;

use App\Helpers\AvatarHelper;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {

            // ── Named test accounts (known login credentials) ─────────────────

            $admin = User::factory()->admin()->create([
                'email' => 'admin@school.test',
                'slug' => 'system-administrator',
            ]);
            $admin->profile()->update([
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

            $officer = User::factory()->officerCatalog()->create([
                'email' => 'officer@school.test',
                'slug' => 'library-officer',
            ]);
            $officer->profile()->update([
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

            $officer2 = User::factory()->officerManagement()->create([
                'email' => 'officer2@school.test',
                'slug' => 'patricia-taylor',
            ]);
            $officer2->profile()->update([
                'full_name' => 'Patricia Taylor',
                'gender' => 'female',
                'phone_number' => '0822222223',
                'address' => 'Library Office Room 2',
                'bio' => 'Assistant librarian',
                'identification_number' => 'LIB-002',
                'occupation' => 'Assistant Librarian',
                'institution' => 'School Library',
                'avatar' => AvatarHelper::generateDefaultAvatar($officer2->id),
            ]);

            $student = User::factory()->create([
                'email' => 'student@school.test',
                'slug' => 'john-student',
            ]);
            $student->profile()->update([
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

            $teacher = User::factory()->create([
                'email' => 'teacher@school.test',
                'slug' => 'jane-teacher',
            ]);
            $teacher->profile()->update([
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

            $member = User::factory()->create([
                'email' => 'member@school.test',
                'slug' => 'general-member',
            ]);
            $member->profile()->update([
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

            // ── Bulk users — profiles auto-created via factory afterCreating ──
            // Total: 6 named + 4 officers + 40 regular = 50 users

            User::factory()->officerCatalog()->count(2)->create();
            User::factory()->officerManagement()->count(2)->create();
            User::factory()->count(40)->create();
        });
    }
}
