<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\ContentPage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContentPageController extends Controller
{
    public function index(): JsonResponse
    {
        $pages = ContentPage::where('is_active', true)->get();

        return ApiResponse::successResponse('Data halaman konten berhasil diambil', $pages);
    }

    public function show(string $slug): JsonResponse
    {
        $page = ContentPage::where('slug', $slug)->where('is_active', true)->first();

        if (!$page) {
            return ApiResponse::errorResponse('Halaman tidak ditemukan', null, 404);
        }

        return ApiResponse::successResponse('Data halaman berhasil diambil', $page);
    }

    public function update(Request $request, string $slug): JsonResponse
    {
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'is_active' => 'boolean',
        ]);

        $page = ContentPage::where('slug', $slug)->first();

        if (!$page) {
            return ApiResponse::errorResponse('Halaman tidak ditemukan', null, 404);
        }

        $page->update($request->only(['title', 'content', 'is_active']));

        return ApiResponse::successResponse('Halaman berhasil diperbarui', $page);
    }

    public function adminIndex(): JsonResponse
    {
        $pages = ContentPage::all();

        return ApiResponse::successResponse('Data halaman konten berhasil diambil', $pages);
    }
}

