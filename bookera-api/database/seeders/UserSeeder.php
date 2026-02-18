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
                'role' => 'officer:catalog',
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

            // Additional Students
            $students = [
                [
                    'email' => 'student2@school.test',
                    'full_name' => 'Sarah Wilson',
                    'gender' => 'female',
                    'phone_number' => '0866666666',
                    'address' => 'Student Street 123',
                    'bio' => 'Passionate about reading fiction',
                    'identification_number' => 'SIS-002',
                    'occupation' => 'Student',
                    'institution' => 'XI RPL 2 - Software Engineering',
                ],
                [
                    'email' => 'student3@school.test',
                    'full_name' => 'Michael Brown',
                    'gender' => 'male',
                    'phone_number' => '0877777777',
                    'address' => 'Dormitory Block B',
                    'bio' => 'Love science and technology books',
                    'identification_number' => 'SIS-003',
                    'occupation' => 'Student',
                    'institution' => 'X TKJ 1 - Computer Network',
                ],
                [
                    'email' => 'student4@school.test',
                    'full_name' => 'Emily Davis',
                    'gender' => 'female',
                    'phone_number' => '0888888888',
                    'address' => 'Student Dormitory A-201',
                    'bio' => 'Enjoys historical novels',
                    'identification_number' => 'SIS-004',
                    'occupation' => 'Student',
                    'institution' => 'XII MM - Multimedia',
                ],
                [
                    'email' => 'student5@school.test',
                    'full_name' => 'David Martinez',
                    'gender' => 'male',
                    'phone_number' => '0899999999',
                    'address' => 'Student Street 456',
                    'bio' => 'Interested in programming books',
                    'identification_number' => 'SIS-005',
                    'occupation' => 'Student',
                    'institution' => 'XI RPL 3 - Software Engineering',
                ],
            ];

            foreach ($students as $studentData) {
                $email = $studentData['email'];
                unset($studentData['email']);

                $user = User::create([
                    'email' => $email,
                    'password' => Hash::make('password'),
                    'role' => 'user',
                    'is_active' => true,
                ]);

                $user->profile()->create(array_merge($studentData, [
                    'avatar' => AvatarHelper::generateDefaultAvatar($user->id),
                ]));
            }

            // Additional Teachers
            $teachers = [
                [
                    'email' => 'teacher2@school.test',
                    'full_name' => 'Robert Johnson',
                    'gender' => 'male',
                    'phone_number' => '0811111112',
                    'address' => 'Teacher Housing Block C',
                    'bio' => 'Physics teacher',
                    'identification_number' => 'TCH-002',
                    'occupation' => 'Teacher',
                    'institution' => 'Physics Department',
                ],
                [
                    'email' => 'teacher3@school.test',
                    'full_name' => 'Linda Anderson',
                    'gender' => 'female',
                    'phone_number' => '0811111113',
                    'address' => 'Teacher Street 789',
                    'bio' => 'English teacher',
                    'identification_number' => 'TCH-003',
                    'occupation' => 'Teacher',
                    'institution' => 'English Department',
                ],
                [
                    'email' => 'teacher4@school.test',
                    'full_name' => 'James Wilson',
                    'gender' => 'male',
                    'phone_number' => '0811111114',
                    'address' => 'Teacher Housing Block D',
                    'bio' => 'Computer Science teacher',
                    'identification_number' => 'TCH-004',
                    'occupation' => 'Teacher',
                    'institution' => 'Computer Science Department',
                ],
            ];

            foreach ($teachers as $teacherData) {
                $email = $teacherData['email'];
                unset($teacherData['email']);

                $user = User::create([
                    'email' => $email,
                    'password' => Hash::make('password'),
                    'role' => 'user',
                    'is_active' => true,
                ]);

                $user->profile()->create(array_merge($teacherData, [
                    'avatar' => AvatarHelper::generateDefaultAvatar($user->id),
                ]));
            }

            // Additional Officers
            $officer2 = User::create([
                'email' => 'officer2@school.test',
                'password' => Hash::make('password'),
                'role' => 'officer:management',
                'is_active' => true,
            ]);

            $officer2->profile()->create([
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
        });
    }
}
