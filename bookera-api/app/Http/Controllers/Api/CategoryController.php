<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ActivityLogger;
use App\Helpers\ApiResponse;
use App\Helpers\SlugGenerator;
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
            'description' => 'nullable|string',
        ]);

        $data['slug'] = SlugGenerator::generate('categories', 'name', $data['name']);

        $category = Category::create($data);

        ActivityLogger::log(
            'create',
            'category',
            "Created category: {$category->name}",
            $category->toArray()
        );

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
            'description' => 'nullable|string',
        ]);

        $data['slug'] = SlugGenerator::generate('categories', 'name', $data['name']);

        $oldData = $category->toArray();

        $category->update($data);

        ActivityLogger::log(
            'update',
            'category',
            "Updated category: {$category->name}",
            $category->toArray(),
            $oldData
        );

        return ApiResponse::successResponse(
            'Kategori berhasil diperbarui',
            $category
        );
    }

    public function destroy(Category $category)
    {
        $deletedCategoryId = $category->id;
        $categoryData = $category->toArray();
        $categoryName = $category->name;

        $category->delete();

        ActivityLogger::log(
            'delete',
            'category',
            "Deleted category: {$categoryName}",
            null,
            $categoryData
        );

        return ApiResponse::successResponse(
            'Kategori berhasil dihapus',
            [
                'deleted_category_id' => $deletedCategoryId,
            ]
        );
    }
}
