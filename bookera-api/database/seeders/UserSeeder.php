<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {

            /*
            |--------------------------------------------------------------------------
            | ADMIN
            |--------------------------------------------------------------------------
            */
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
            ]);

            /*
            |--------------------------------------------------------------------------
            | STUDENT
            |--------------------------------------------------------------------------
            */
            $student = User::create([
                'email' => 'student@school.test',
                'password' => Hash::make('password'),
                'role' => 'student',
                'is_active' => true,
            ]);

            $student->profile()->create([
                'full_name' => 'John Student',
                'gender' => 'male',
                'phone_number' => '0822222222',
                'address' => 'Student Dormitory',
            ]);

            $student->studentDetail()->create([
                'student_number' => 'SIS-001',
                'class' => 'XI RPL 1',
                'major' => 'Software Engineering',
                'enrollment_year' => 2023,
            ]);

            /*
            |--------------------------------------------------------------------------
            | TEACHER
            |--------------------------------------------------------------------------
            */
            $teacher = User::create([
                'email' => 'teacher@school.test',
                'password' => Hash::make('password'),
                'role' => 'teacher',
                'is_active' => true,
            ]);

            $teacher->profile()->create([
                'full_name' => 'Jane Teacher',
                'gender' => 'female',
                'phone_number' => '0833333333',
                'address' => 'Teacher Housing',
            ]);

            $teacher->teacherDetail()->create([
                'employee_number' => 'EMP-001',
                'subject' => 'Mathematics',
            ]);

            /*
            |--------------------------------------------------------------------------
            | STAFF / LIBRARIAN
            |--------------------------------------------------------------------------
            */
            $staff = User::create([
                'email' => 'librarian@school.test',
                'password' => Hash::make('password'),
                'role' => 'staff',
                'is_active' => true,
            ]);

            $staff->profile()->create([
                'full_name' => 'Library Staff',
                'gender' => 'female',
                'phone_number' => '0844444444',
                'address' => 'Library Office',
            ]);

            $staff->staffDetail()->create([
                'staff_number' => 'STF-001',
                'position' => 'Librarian',
                'department' => 'Library',
            ]);
        });
    }
}
