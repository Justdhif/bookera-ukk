<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ApiResponse;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TeacherController extends Controller
{
    public function index()
    {
        $teachers = User::with(['profile', 'teacherDetail'])
            ->where('role', 'teacher')
            ->latest()
            ->get();

        return ApiResponse::successResponse(
            'Data guru berhasil diambil',
            $teachers
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',

            'full_name' => 'required|string',
            'gender' => 'nullable|string',
            'phone_number' => 'nullable|string',
            'address' => 'nullable|string',

            'employee_number' => 'required|string|unique:teacher_details,employee_number',
            'subject' => 'nullable|string',
        ]);

        $teacher = DB::transaction(function () use ($data) {

            $user = User::create([
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'teacher',
                'is_active' => true,
            ]);

            $user->profile()->create([
                'full_name' => $data['full_name'],
                'gender' => $data['gender'] ?? null,
                'phone_number' => $data['phone_number'] ?? null,
                'address' => $data['address'] ?? null,
            ]);

            $user->teacherDetail()->create([
                'employee_number' => $data['employee_number'],
                'subject' => $data['subject'] ?? null,
            ]);

            $user->load(['profile', 'teacherDetail']);

            return $user;
        });

        return ApiResponse::successResponse(
            'Guru berhasil ditambahkan',
            $teacher,
            201
        );
    }

    public function show($id)
    {
        $teacher = User::with(['profile', 'teacherDetail'])
            ->where('role', 'teacher')
            ->findOrFail($id);

        return ApiResponse::successResponse(
            'Detail guru',
            $teacher
        );
    }

    public function update(Request $request, $id)
    {
        $teacher = User::where('role', 'teacher')->findOrFail($id);

        $data = $request->validate([
            'password' => 'nullable|min:6',

            'full_name' => 'required|string',
            'gender' => 'nullable|string',
            'phone_number' => 'nullable|string',
            'address' => 'nullable|string',

            'employee_number' => 'required|string|unique:teacher_details,employee_number,' . $teacher->teacherDetail->id,
            'subject' => 'nullable|string',
        ]);

        $updatedTeacher = DB::transaction(function () use ($teacher, $data) {

            if (!empty($data['password'])) {
                $teacher->update([
                    'password' => Hash::make($data['password']),
                ]);
            }

            $teacher->profile->update([
                'full_name' => $data['full_name'],
                'gender' => $data['gender'] ?? null,
                'phone_number' => $data['phone_number'] ?? null,
                'address' => $data['address'] ?? null,
            ]);

            $teacher->teacherDetail->update([
                'employee_number' => $data['employee_number'],
                'subject' => $data['subject'] ?? null,
            ]);

            $teacher->load(['profile', 'teacherDetail']);

            return $teacher;
        });

        return ApiResponse::successResponse(
            'Data guru berhasil diperbarui',
            $updatedTeacher
        );
    }

    public function destroy($id)
    {
        $teacher = User::where('role', 'teacher')->findOrFail($id);
        $deletedTeacherId = $teacher->id;

        $teacher->delete();

        return ApiResponse::successResponse(
            'Guru berhasil dihapus',
            [
                'deleted_teacher_id' => $deletedTeacherId
            ]
        );
    }
}
