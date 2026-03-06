<?php

namespace App\Services\Category;

use App\Helpers\ActivityLogger;
use App\Helpers\SlugGenerator;
use App\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CategoryService
{
    public function getCategories(array $filters): LengthAwarePaginator
    {
        return Category::query()
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->latest()
            ->orderByDesc('id')
            ->paginate($filters['per_page'] ?? 15);
    }

    public function createCategory(array $data): Category
    {
        $data['slug'] = SlugGenerator::generate('categories', 'name', $data['name']);

        $category = Category::create($data);

        ActivityLogger::log(
            'create',
            'category',
            "Created category: {$category->name}",
            $category->toArray(),
            null,
            $category
        );

        return $category;
    }

    public function updateCategory(Category $category, array $data): Category
    {
        $data['slug'] = SlugGenerator::generate('categories', 'name', $data['name']);

        $oldData = $category->toArray();

        $category->update($data);

        ActivityLogger::log(
            'update',
            'category',
            "Updated category: {$category->name}",
            $category->toArray(),
            $oldData,
            $category
        );

        return $category;
    }

    public function deleteCategory(Category $category): array
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
            $categoryData,
            null
        );

        return ['deleted_category_id' => $deletedCategoryId];
    }
}
