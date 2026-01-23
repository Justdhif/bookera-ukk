<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ApiResponse;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::latest()->get();

        return ApiResponse::successResponse(
            'Data kategori berhasil diambil',
            $categories
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|unique:categories,name',
        ]);

        $category = Category::create($data);

        return ApiResponse::successResponse(
            'Kategori berhasil ditambahkan',
            $category,
            201
        );
    }

    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'name' => 'required|string|unique:categories,name,' . $category->id,
        ]);

        $category->update($data);

        return ApiResponse::successResponse(
            'Kategori berhasil diperbarui',
            $category
        );
    }

    public function destroy(Category $category)
    {
        $deletedCategoryId = $category->id;

        $category->delete();

        return ApiResponse::successResponse(
            'Kategori berhasil dihapus',
            [
                'deleted_category_id' => $deletedCategoryId,
            ]
        );
    }
}
