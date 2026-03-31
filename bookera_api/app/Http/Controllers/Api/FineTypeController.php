<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\FineType\StoreFineTypeRequest;
use App\Http\Requests\FineType\UpdateFineTypeRequest;
use App\Models\FineType;
use App\Services\FineType\FineTypeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FineTypeController extends Controller
{
    private FineTypeService $fineTypeService;

    public function __construct(FineTypeService $fineTypeService)
    {
        $this->fineTypeService = $fineTypeService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'search'   => $request->search,
            'type'     => $request->type,
            'per_page' => $request->per_page,
        ];

        $fineTypes = $this->fineTypeService->getAll($filters);

        return ApiResponse::successResponse('Data tipe denda', $fineTypes);
    }

    public function store(StoreFineTypeRequest $request): JsonResponse
    {
        $fineType = $this->fineTypeService->create($request->validated());

        return ApiResponse::successResponse('Tipe denda berhasil dibuat', $fineType, 201);
    }

    public function show(FineType $fineType): JsonResponse
    {
        return ApiResponse::successResponse('Detail tipe denda', $fineType);
    }

    public function update(UpdateFineTypeRequest $request, FineType $fineType): JsonResponse
    {
        $fineType = $this->fineTypeService->update($fineType, $request->validated());

        return ApiResponse::successResponse('Tipe denda berhasil diupdate', $fineType);
    }

    public function destroy(FineType $fineType): JsonResponse
    {
        if (!$this->fineTypeService->canDelete($fineType)) {
            return ApiResponse::errorResponse('Tipe denda ini masih digunakan dan tidak dapat dihapus', null, 400);
        }

        $this->fineTypeService->delete($fineType);

        return ApiResponse::successResponse('Tipe denda berhasil dihapus');
    }
}
