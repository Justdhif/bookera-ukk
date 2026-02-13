<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\TermsOfService\StoreTermsOfServiceRequest;
use App\Http\Requests\TermsOfService\UpdateTermsOfServiceRequest;
use App\Models\TermsOfService;
use App\Services\TermsOfService\TermsOfServiceService;
use Illuminate\Http\JsonResponse;

class TermsOfServiceController extends Controller
{
    private TermsOfServiceService $termsOfServiceService;

    public function __construct(TermsOfServiceService $termsOfServiceService)
    {
        $this->termsOfServiceService = $termsOfServiceService;
    }

    public function index(): JsonResponse
    {
        $termsOfServices = $this->termsOfServiceService->getAllTermsOfServices();

        return ApiResponse::successResponse('Data Terms of Service berhasil diambil', $termsOfServices);
    }

    public function show(TermsOfService $termsOfService): JsonResponse
    {
        return ApiResponse::successResponse('Detail Terms of Service berhasil diambil', $termsOfService);
    }

    public function store(StoreTermsOfServiceRequest $request): JsonResponse
    {
        $termsOfService = $this->termsOfServiceService->createTermsOfService($request->validated());

        return ApiResponse::successResponse('Terms of Service berhasil ditambahkan', $termsOfService, 201);
    }

    public function update(UpdateTermsOfServiceRequest $request, TermsOfService $termsOfService): JsonResponse
    {
        $termsOfService = $this->termsOfServiceService->updateTermsOfService($termsOfService, $request->validated());

        return ApiResponse::successResponse('Terms of Service berhasil diperbarui', $termsOfService);
    }

    public function destroy(TermsOfService $termsOfService): JsonResponse
    {
        $this->termsOfServiceService->deleteTermsOfService($termsOfService);

        return ApiResponse::successResponse('Terms of Service berhasil dihapus');
    }
}
