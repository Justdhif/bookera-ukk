<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DiscountKeyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = \App\Models\DiscountKey::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('key', 'like', "%{$search}%");
            });
        }

        $perPage = $request->input('per_page', 10);
        $keys = $query->latest()->paginate($perPage);

        return \App\Helpers\ApiResponse::successResponse('Discount keys retrieved successfully.', $keys);
    }

    public function store(\App\Http\Requests\DiscountKey\StoreDiscountKeyRequest $request): JsonResponse
    {
        $key = \App\Models\DiscountKey::create($request->validated());

        \App\Helpers\ActivityLogger::log(
            'create',
            'discount_key',
            "Created discount key: {$key->name}",
            $key->toArray(),
            null,
            $key
        );

        return \App\Helpers\ApiResponse::successResponse('Discount key created successfully.', $key, 201);
    }

    public function destroy(\App\Models\DiscountKey $discount_key): JsonResponse
    {
        $keyName = $discount_key->name;
        $keyData = $discount_key->toArray();

        $discount_key->delete();

        \App\Helpers\ActivityLogger::log(
            'delete',
            'discount_key',
            "Deleted discount key: {$keyName}",
            null,
            $keyData,
            null
        );

        return \App\Helpers\ApiResponse::successResponse('Discount key deleted successfully.');
    }
}
