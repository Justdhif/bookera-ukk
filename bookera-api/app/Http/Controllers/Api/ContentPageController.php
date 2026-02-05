<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ActivityLogger;
use App\Helpers\ApiResponse;
use App\Models\ContentPage;
use Illuminate\Http\Request;

class ContentPageController extends Controller
{
    /**
     * Display a listing of content pages (all pages).
     */
    public function index()
    {
        $pages = ContentPage::where('is_active', true)->latest()->get();

        return ApiResponse::successResponse(
            'Data halaman konten berhasil diambil',
            $pages
        );
    }

    /**
     * Display a specific content page by slug.
     */
    public function show($slug)
    {
        $page = ContentPage::where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (!$page) {
            return ApiResponse::errorResponse(
                'Halaman tidak ditemukan',
                null,
                404
            );
        }

        return ApiResponse::successResponse(
            'Data halaman berhasil diambil',
            $page
        );
    }

    /**
     * Update a content page (admin only).
     */
    public function update(Request $request, $slug)
    {
        $page = ContentPage::where('slug', $slug)->first();

        if (!$page) {
            return ApiResponse::errorResponse(
                'Halaman tidak ditemukan',
                null,
                404
            );
        }

        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $oldData = $page->toArray();

        $page->update($data);

        ActivityLogger::log(
            'update',
            'content_page',
            "Updated content page: {$page->title}",
            $page->toArray(),
            $oldData,
            $page
        );

        return ApiResponse::successResponse(
            'Halaman berhasil diperbarui',
            $page
        );
    }

    /**
     * Get all content pages (admin only - including inactive).
     */
    public function adminIndex()
    {
        $pages = ContentPage::latest()->get();

        return ApiResponse::successResponse(
            'Data halaman konten berhasil diambil',
            $pages
        );
    }
}
