<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{
    public function index()
    {
        return User::with(['profile', 'studentDetail'])
            ->where('role', 'student')
            ->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'full_name' => 'required',
            'student_number' => 'required|unique:student_details,student_number',
            'class' => 'required',
        ]);

        return DB::transaction(function () use ($request) {
            $user = User::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'student',
                'is_active' => true,
            ]);

            $user->profile()->create([
                'full_name' => $request->full_name,
                'gender' => $request->gender,
                'phone_number' => $request->phone_number,
                'address' => $request->address,
            ]);

            $user->studentDetail()->create([
                'student_number' => $request->student_number,
                'class' => $request->class,
                'major' => $request->major,
                'enrollment_year' => $request->enrollment_year,
            ]);

            return response()->json($user->load(['profile', 'studentDetail']), 201);
        });
    }

    public function show($id)
    {
        return User::with(['profile', 'studentDetail'])
            ->where('role', 'student')
            ->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $user = User::where('role', 'student')->findOrFail($id);

        return DB::transaction(function () use ($request, $user) {

            if ($request->filled('password')) {
                $user->update([
                    'password' => Hash::make($request->password),
                ]);
            }

            $user->profile->update($request->only([
                'full_name',
                'gender',
                'phone_number',
                'address'
            ]));

            $user->studentDetail->update($request->only([
                'student_number',
                'class',
                'major',
                'enrollment_year'
            ]));

            return response()->json($user->load(['profile', 'studentDetail']));
        });
    }

    public function destroy($id)
    {
        $user = User::where('role', 'student')->findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'Student deleted']);
    }
}   
