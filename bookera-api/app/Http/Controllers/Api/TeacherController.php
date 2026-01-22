<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TeacherController extends Controller
{
    public function index()
    {
        return User::with(['profile', 'teacherDetail'])
            ->where('role', 'teacher')
            ->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'full_name' => 'required',
            'employee_number' => 'required|unique:teacher_details,employee_number',
        ]);

        return DB::transaction(function () use ($request) {
            $user = User::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'teacher',
            ]);

            $user->profile()->create([
                'full_name' => $request->full_name,
                'gender' => $request->gender,
                'phone_number' => $request->phone_number,
                'address' => $request->address,
            ]);

            $user->teacherDetail()->create([
                'employee_number' => $request->employee_number,
                'subject' => $request->subject,
            ]);

            return response()->json($user->load(['profile', 'teacherDetail']), 201);
        });
    }

    public function show($id)
    {
        return User::with(['profile', 'teacherDetail'])
            ->where('role', 'teacher')
            ->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $user = User::where('role', 'teacher')->findOrFail($id);

        return DB::transaction(function () use ($request, $user) {
            $user->profile->update($request->only([
                'full_name',
                'gender',
                'phone_number',
                'address'
            ]));

            $user->teacherDetail->update($request->only([
                'employee_number',
                'subject'
            ]));

            return response()->json($user->load(['profile', 'teacherDetail']));
        });
    }

    public function destroy($id)
    {
        User::where('role', 'teacher')->findOrFail($id)->delete();
        return response()->json(['message' => 'Teacher deleted']);
    }
}
