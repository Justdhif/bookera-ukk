<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ActivityLogger;
use App\Helpers\ApiResponse;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{
    public function index()
    {
        $students = User::with(['profile', 'studentDetail'])
            ->where('role', 'student')
            ->latest()
            ->get();

        return ApiResponse::successResponse(
            'Data siswa berhasil diambil',
            $students
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

            'student_number' => 'required|string|unique:student_details,student_number',
            'class' => 'required|string',
            'major' => 'nullable|string',
            'enrollment_year' => 'nullable|integer',
        ]);

        $student = DB::transaction(function () use ($data) {

            $user = User::create([
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'student',
                'is_active' => true,
            ]);

            $user->profile()->create([
                'full_name' => $data['full_name'],
                'gender' => $data['gender'] ?? null,
                'phone_number' => $data['phone_number'] ?? null,
                'address' => $data['address'] ?? null,
            ]);

            $user->studentDetail()->create([
                'student_number' => $data['student_number'],
                'class' => $data['class'],
                'major' => $data['major'] ?? null,
                'enrollment_year' => $data['enrollment_year'] ?? null,
            ]);

            $user->load(['profile', 'studentDetail']);

            ActivityLogger::log(
                'create',
                'student',
                "Created student: {$user->profile->full_name} ({$user->email})",
                $user->toArray()
            );

            return $user;
        });

        return ApiResponse::successResponse(
            'Siswa berhasil ditambahkan',
            $student,
            201
        );
    }

    public function show($id)
    {
        $student = User::with(['profile', 'studentDetail'])
            ->where('role', 'student')
            ->findOrFail($id);

        return ApiResponse::successResponse(
            'Detail siswa',
            $student
        );
    }

    public function update(Request $request, $id)
    {
        $student = User::where('role', 'student')->findOrFail($id);

        $data = $request->validate([
            'password' => 'nullable|min:6',

            'full_name' => 'required|string',
            'gender' => 'nullable|string',
            'phone_number' => 'nullable|string',
            'address' => 'nullable|string',

            'student_number' => 'required|string|unique:student_details,student_number,' . $student->studentDetail->id,
            'class' => 'required|string',
            'major' => 'nullable|string',
            'enrollment_year' => 'nullable|integer',
        ]);

        $updatedStudent = DB::transaction(function () use ($student, $data) {

            $oldData = [
                'profile' => $student->profile->toArray(),
                'detail' => $student->studentDetail->toArray(),
            ];

            if (!empty($data['password'])) {
                $student->update([
                    'password' => Hash::make($data['password']),
                ]);
            }

            $student->profile->update([
                'full_name' => $data['full_name'],
                'gender' => $data['gender'] ?? null,
                'phone_number' => $data['phone_number'] ?? null,
                'address' => $data['address'] ?? null,
            ]);

            $student->studentDetail->update([
                'student_number' => $data['student_number'],
                'class' => $data['class'],
                'major' => $data['major'] ?? null,
                'enrollment_year' => $data['enrollment_year'] ?? null,
            ]);

            $student->load(['profile', 'studentDetail']);

            ActivityLogger::log(
                'update',
                'student',
                "Updated student: {$student->profile->full_name} ({$student->email})",
                $student->toArray(),
                $oldData
            );

            return $student;
        });

        return ApiResponse::successResponse(
            'Data siswa berhasil diperbarui',
            $updatedStudent
        );
    }

    public function destroy($id)
    {
        $student = User::where('role', 'student')->findOrFail($id);
        $student->load(['profile', 'studentDetail']);
        $deletedStudentId = $student->id;
        $oldData = $student->toArray();

        $student->delete();

        ActivityLogger::log(
            'delete',
            'student',
            "Deleted student: {$oldData['profile']['full_name']} ({$oldData['email']})",
            null,
            $oldData
        );

        return ApiResponse::successResponse(
            'Siswa berhasil dihapus',
            [
                'deleted_student_id' => $deletedStudentId
            ]
        );
    }
}
