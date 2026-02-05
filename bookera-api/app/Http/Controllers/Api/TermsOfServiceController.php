<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ActivityLogger;
use App\Helpers\ApiResponse;
use App\Models\TermsOfService;
use Illuminate\Http\Request;

class TermsOfServiceController extends Controller
{
    /**
     * Get all terms of service
     */
    public function index()
    {
        $termsOfServices = TermsOfService::orderBy('created_at', 'desc')->get();

        return ApiResponse::successResponse(
            'Data Terms of Service berhasil diambil',
            $termsOfServices
        );
    }

    /**
     * Get specific terms of service by ID
     */
    public function show(TermsOfService $termsOfService)
    {
        return ApiResponse::successResponse(
            'Detail Terms of Service berhasil diambil',
            $termsOfService
        );
    }

    /**
     * Create new terms of service (admin)
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $termsOfService = TermsOfService::create($data);

        ActivityLogger::log(
            'create',
            'terms_of_service',
            "Created Terms of Service: {$termsOfService->title}",
            $termsOfService->toArray(),
            null,
            $termsOfService
        );

        return ApiResponse::successResponse(
            'Terms of Service berhasil ditambahkan',
            $termsOfService,
            201
        );
    }

    /**
     * Update terms of service (admin)
     */
    public function update(Request $request, TermsOfService $termsOfService)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $oldData = $termsOfService->toArray();

        $termsOfService->update($data);

        ActivityLogger::log(
            'update',
            'terms_of_service',
            "Updated Terms of Service: {$termsOfService->title}",
            $termsOfService->toArray(),
            $oldData,
            $termsOfService
        );

        return ApiResponse::successResponse(
            'Terms of Service berhasil diperbarui',
            $termsOfService
        );
    }

    /**
     * Delete terms of service (admin)
     */
    public function destroy(TermsOfService $termsOfService)
    {
        $oldData = $termsOfService->toArray();

        $termsOfService->delete();

        ActivityLogger::log(
            'delete',
            'terms_of_service',
            "Deleted Terms of Service: {$oldData['title']}",
            null,
            $oldData
        );

        return ApiResponse::successResponse(
            'Terms of Service berhasil dihapus'
        );
    }
}
