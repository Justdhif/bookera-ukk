<?php

namespace App\Http\Controllers\Api\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\MembershipDiscount\StoreMembershipDiscountRequest;
use App\Http\Requests\MembershipDiscount\UpdateMembershipDiscountRequest;
use App\Models\MembershipDiscount;
use App\Services\MembershipDiscount\MembershipDiscountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MembershipDiscountController extends Controller
{
    private MembershipDiscountService $discountService;

    public function __construct(MembershipDiscountService $discountService)
    {
        $this->discountService = $discountService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'search'   => $request->search,
            'per_page' => $request->per_page,
        ];

        $discounts = $this->discountService->getAll($filters);

        return ApiResponse::successResponse('Membership discounts retrieved successfully.', $discounts);
    }

    public function store(StoreMembershipDiscountRequest $request): JsonResponse
    {
        $discount = $this->discountService->create($request->validated());

        return ApiResponse::successResponse('Membership discount created successfully.', $discount, 201);
    }

    public function update(UpdateMembershipDiscountRequest $request, MembershipDiscount $membership_discount): JsonResponse
    {
        $discount = $this->discountService->update($membership_discount, $request->validated());

        return ApiResponse::successResponse('Membership discount updated successfully.', $discount);
    }

    public function destroy(MembershipDiscount $membership_discount): JsonResponse
    {
        $this->discountService->delete($membership_discount);

        return ApiResponse::successResponse('Membership discount deleted successfully.');
    }
}
