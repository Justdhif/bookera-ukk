<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ApiResponse;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StaffController extends Controller
{
    public function index()
    {
        $staffs = User::with(['profile', 'staffDetail'])
            ->where('role', 'staff')
            ->latest()
            ->get();

        return ApiResponse::successResponse(
            'Data staff berhasil diambil',
            $staffs
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

            'staff_number' => 'required|string|unique:staff_details,staff_number',
            'position' => 'nullable|string',
            'department' => 'nullable|string',
        ]);

        $staff = DB::transaction(function () use ($data) {

            $user = User::create([
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'staff',
            ]);

            $user->profile()->create([
                'full_name' => $data['full_name'],
                'gender' => $data['gender'] ?? null,
                'phone_number' => $data['phone_number'] ?? null,
                'address' => $data['address'] ?? null,
            ]);

            $user->staffDetail()->create([
                'staff_number' => $data['staff_number'],
                'position' => $data['position'] ?? null,
                'department' => $data['department'] ?? null,
            ]);

            $user->load(['profile', 'staffDetail']);

            return $user;
        });

        return ApiResponse::successResponse(
            'Staff berhasil ditambahkan',
            $staff,
            201
        );
    }

    public function show($id)
    {
        $staff = User::with(['profile', 'staffDetail'])
            ->where('role', 'staff')
            ->findOrFail($id);

        return ApiResponse::successResponse(
            'Detail staff',
            $staff
        );
    }

    public function update(Request $request, $id)
    {
        $staff = User::where('role', 'staff')->findOrFail($id);

        $data = $request->validate([
            'full_name' => 'required|string',
            'gender' => 'nullable|string',
            'phone_number' => 'nullable|string',
            'address' => 'nullable|string',

            'staff_number' => 'required|string|unique:staff_details,staff_number,' . $staff->staffDetail->id,
            'position' => 'nullable|string',
            'department' => 'nullable|string',
        ]);

        $updatedStaff = DB::transaction(function () use ($staff, $data) {

            $staff->profile->update([
                'full_name' => $data['full_name'],
                'gender' => $data['gender'] ?? null,
                'phone_number' => $data['phone_number'] ?? null,
                'address' => $data['address'] ?? null,
            ]);

            $staff->staffDetail->update([
                'staff_number' => $data['staff_number'],
                'position' => $data['position'] ?? null,
                'department' => $data['department'] ?? null,
            ]);

            $staff->load(['profile', 'staffDetail']);

            return $staff;
        });

        return ApiResponse::successResponse(
            'Data staff berhasil diperbarui',
            $updatedStaff
        );
    }

    public function destroy($id)
    {
        $staff = User::where('role', 'staff')->findOrFail($id);
        $deletedStaffId = $staff->id;

        $staff->delete();

        return ApiResponse::successResponse(
            'Staff berhasil dihapus',
            [
                'deleted_staff_id' => $deletedStaffId,
            ]
        );
    }
}
