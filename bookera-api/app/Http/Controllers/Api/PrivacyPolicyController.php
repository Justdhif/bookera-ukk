<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\PrivacyPolicy\StorePrivacyPolicyRequest;
use App\Http\Requests\PrivacyPolicy\UpdatePrivacyPolicyRequest;
use App\Models\PrivacyPolicy;
use App\Services\PrivacyPolicy\PrivacyPolicyService;
use Illuminate\Http\JsonResponse;

class PrivacyPolicyController extends Controller
{
    private PrivacyPolicyService $privacyPolicyService;

    public function __construct(PrivacyPolicyService $privacyPolicyService)
    {
        $this->privacyPolicyService = $privacyPolicyService;
    }

    public function index(): JsonResponse
    {
        $privacyPolicies = $this->privacyPolicyService->getAllPrivacyPolicies();

        return ApiResponse::successResponse('Data Privacy Policy berhasil diambil', $privacyPolicies);
    }

    public function show(PrivacyPolicy $privacyPolicy): JsonResponse
    {
        return ApiResponse::successResponse('Detail Privacy Policy berhasil diambil', $privacyPolicy);
    }

    public function store(StorePrivacyPolicyRequest $request): JsonResponse
    {
        $privacyPolicy = $this->privacyPolicyService->createPrivacyPolicy($request->validated());

        return ApiResponse::successResponse('Privacy Policy berhasil ditambahkan', $privacyPolicy, 201);
    }

    public function update(UpdatePrivacyPolicyRequest $request, PrivacyPolicy $privacyPolicy): JsonResponse
    {
        $privacyPolicy = $this->privacyPolicyService->updatePrivacyPolicy($privacyPolicy, $request->validated());

        return ApiResponse::successResponse('Privacy Policy berhasil diperbarui', $privacyPolicy);
    }

    public function destroy(PrivacyPolicy $privacyPolicy): JsonResponse
    {
        $this->privacyPolicyService->deletePrivacyPolicy($privacyPolicy);

        return ApiResponse::successResponse('Privacy Policy berhasil dihapus');
    }
}
