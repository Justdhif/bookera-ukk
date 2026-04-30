<?php

namespace App\Http\Controllers\Api\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\MembershipPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MembershipPlanController extends Controller
{
    /**
     * Display a listing of the membership plans.
     */
    public function index(): JsonResponse
    {
        $plans = MembershipPlan::all();

        return ApiResponse::successResponse('Membership plans retrieved successfully.', $plans);
    }

    /**
     * Update the specified membership plan.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'description' => 'required|string',
        ]);

        $plan = MembershipPlan::findOrFail($id);
        
        $plan->update($request->only([
            'name',
            'price',
            'description'
        ]));

        return ApiResponse::successResponse('Membership plan updated successfully.', $plan);
    }
}
