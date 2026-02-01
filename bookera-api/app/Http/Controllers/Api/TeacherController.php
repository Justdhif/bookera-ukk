<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ActivityLogger;
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

            ActivityLogger::log(
                'create',
                'teacher',
                "Created teacher: {$user->profile->full_name} ({$user->email})",
                $user->toArray()
            );

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

            $oldData = [
                'profile' => $teacher->profile->toArray(),
                'detail' => $teacher->teacherDetail->toArray(),
            ];

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

            ActivityLogger::log(
                'update',
                'teacher',
                "Updated teacher: {$teacher->profile->full_name} ({$teacher->email})",
                $teacher->toArray(),
                $oldData
            );

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
        $teacher->load(['profile', 'teacherDetail']);
        $deletedTeacherId = $teacher->id;
        $oldData = $teacher->toArray();

        $teacher->delete();

        ActivityLogger::log(
            'delete',
            'teacher',
            "Deleted teacher: {$oldData['profile']['full_name']} ({$oldData['email']})",
            null,
            $oldData
        );

        return ApiResponse::successResponse(
            'Guru berhasil dihapus',
            [
                'deleted_teacher_id' => $deletedTeacherId
            ]
        );
    }
}
