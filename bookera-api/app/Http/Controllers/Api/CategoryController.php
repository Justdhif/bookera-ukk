<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Models\Category;
use App\Services\Category\CategoryService;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    private CategoryService $categoryService;

    public function __construct(CategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }

    public function index(): JsonResponse
    {
        $categories = $this->categoryService->getAllCategories();

        return ApiResponse::successResponse('Data kategori berhasil diambil', $categories);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->categoryService->createCategory($request->validated());

        return ApiResponse::successResponse('Kategori berhasil ditambahkan', $category, 201);
    }

    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $category = $this->categoryService->updateCategory($category, $request->validated());

        return ApiResponse::successResponse('Kategori berhasil diperbarui', $category);
    }

    public function destroy(Category $category): JsonResponse
    {
        $data = $this->categoryService->deleteCategory($category);

        return ApiResponse::successResponse('Kategori berhasil dihapus', $data);
    }
}

