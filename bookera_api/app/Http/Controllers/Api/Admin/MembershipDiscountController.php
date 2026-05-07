<?php

namespace App\Http\Controllers\Api\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\MembershipDiscount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MembershipDiscountController extends Controller
{
    public function index(): JsonResponse
    {
        $discounts = MembershipDiscount::all();
        return ApiResponse::successResponse('Membership discounts retrieved successfully.', $discounts);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'discount_percentage' => 'required|numeric|min:0|max:100',
            'description' => 'nullable|string',
        ]);

        $discount = MembershipDiscount::findOrFail($id);
        $discount->update($request->only(['name', 'discount_percentage', 'description']));

        return ApiResponse::successResponse('Membership discount updated successfully.', $discount);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'discount_key' => 'required|string|unique:membership_discounts,discount_key',
            'name' => 'required|string|max:255',
            'discount_percentage' => 'required|numeric|min:0|max:100',
            'description' => 'nullable|string',
        ]);

        $discount = MembershipDiscount::create($request->all());

        return ApiResponse::successResponse('Membership discount created successfully.', $discount);
    }

    public function destroy($id): JsonResponse
    {
        $discount = MembershipDiscount::findOrFail($id);
        $discount->delete();

        return ApiResponse::successResponse('Membership discount deleted successfully.', null);
    }
}
