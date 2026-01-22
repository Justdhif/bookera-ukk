<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StaffController extends Controller
{
    public function index()
    {
        return User::with(['profile', 'staffDetail'])
            ->where('role', 'staff')
            ->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'full_name' => 'required',
            'staff_number' => 'required|unique:staff_details,staff_number',
        ]);

        return DB::transaction(function () use ($request) {
            $user = User::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'staff',
            ]);

            $user->profile()->create([
                'full_name' => $request->full_name,
                'gender' => $request->gender,
                'phone_number' => $request->phone_number,
                'address' => $request->address,
            ]);

            $user->staffDetail()->create([
                'staff_number' => $request->staff_number,
                'position' => $request->position,
                'department' => $request->department,
            ]);

            return response()->json($user->load(['profile', 'staffDetail']), 201);
        });
    }

    public function show($id)
    {
        return User::with(['profile', 'staffDetail'])
            ->where('role', 'staff')
            ->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $user = User::where('role', 'staff')->findOrFail($id);

        return DB::transaction(function () use ($request, $user) {
            $user->profile->update($request->only([
                'full_name',
                'gender',
                'phone_number',
                'address'
            ]));

            $user->staffDetail->update($request->only([
                'staff_number',
                'position',
                'department'
            ]));

            return response()->json($user->load(['profile', 'staffDetail']));
        });
    }

    public function destroy($id)
    {
        User::where('role', 'staff')->findOrFail($id)->delete();
        return response()->json(['message' => 'Staff deleted']);
    }
}
