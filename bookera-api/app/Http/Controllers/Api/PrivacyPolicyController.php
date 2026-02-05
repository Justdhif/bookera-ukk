<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ActivityLogger;
use App\Helpers\ApiResponse;
use App\Models\PrivacyPolicy;
use Illuminate\Http\Request;

class PrivacyPolicyController extends Controller
{
    /**
     * Get all privacy policies
     */
    public function index()
    {
        $privacyPolicies = PrivacyPolicy::orderBy('created_at', 'desc')->get();

        return ApiResponse::successResponse(
            'Data Privacy Policy berhasil diambil',
            $privacyPolicies
        );
    }

    /**
     * Get specific privacy policy by ID
     */
    public function show(PrivacyPolicy $privacyPolicy)
    {
        return ApiResponse::successResponse(
            'Detail Privacy Policy berhasil diambil',
            $privacyPolicy
        );
    }

    /**
     * Create new privacy policy (admin)
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $privacyPolicy = PrivacyPolicy::create($data);

        ActivityLogger::log(
            'create',
            'privacy_policy',
            "Created Privacy Policy: {$privacyPolicy->title}",
            $privacyPolicy->toArray(),
            null,
            $privacyPolicy
        );

        return ApiResponse::successResponse(
            'Privacy Policy berhasil ditambahkan',
            $privacyPolicy,
            201
        );
    }

    /**
     * Update privacy policy (admin)
     */
    public function update(Request $request, PrivacyPolicy $privacyPolicy)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $oldData = $privacyPolicy->toArray();

        $privacyPolicy->update($data);

        ActivityLogger::log(
            'update',
            'privacy_policy',
            "Updated Privacy Policy: {$privacyPolicy->title}",
            $privacyPolicy->toArray(),
            $oldData,
            $privacyPolicy
        );

        return ApiResponse::successResponse(
            'Privacy Policy berhasil diperbarui',
            $privacyPolicy
        );
    }

    /**
     * Delete privacy policy (admin)
     */
    public function destroy(PrivacyPolicy $privacyPolicy)
    {
        $oldData = $privacyPolicy->toArray();

        $privacyPolicy->delete();

        ActivityLogger::log(
            'delete',
            'privacy_policy',
            "Deleted Privacy Policy: {$oldData['title']}",
            null,
            $oldData
        );

        return ApiResponse::successResponse(
            'Privacy Policy berhasil dihapus'
        );
    }
}
