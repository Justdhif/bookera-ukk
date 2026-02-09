<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ActivityLogger;
use App\Helpers\ApiResponse;
use App\Models\FineType;
use Illuminate\Http\Request;

class FineTypeController extends Controller
{
    /**
     * Get all fine types
     */
    public function index(Request $request)
    {
        $query = FineType::query();

        // Filter by type
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $fineTypes = $query->latest()->get();

        return ApiResponse::successResponse(
            'Data tipe denda',
            $fineTypes
        );
    }

    /**
     * Create new fine type
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:lost,damaged,late',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        $fineType = FineType::create($data);

        ActivityLogger::log(
            'create',
            'fine_type',
            "Fine type '{$fineType->name}' created",
            [
                'fine_type_id' => $fineType->id,
                'name' => $fineType->name,
                'type' => $fineType->type,
                'amount' => $fineType->amount,
            ],
            null,
            $fineType
        );

        return ApiResponse::successResponse(
            'Tipe denda berhasil dibuat',
            $fineType,
            201
        );
    }

    /**
     * Get fine type detail
     */
    public function show(FineType $fineType)
    {
        return ApiResponse::successResponse(
            'Detail tipe denda',
            $fineType
        );
    }

    /**
     * Update fine type
     */
    public function update(Request $request, FineType $fineType)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|in:lost,damaged,late',
            'amount' => 'sometimes|required|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        $oldData = $fineType->toArray();
        $fineType->update($data);

        ActivityLogger::log(
            'update',
            'fine_type',
            "Fine type #{$fineType->id} updated",
            [
                'fine_type_id' => $fineType->id,
                'name' => $fineType->name,
                'type' => $fineType->type,
                'amount' => $fineType->amount,
            ],
            $oldData,
            $fineType
        );

        return ApiResponse::successResponse(
            'Tipe denda berhasil diupdate',
            $fineType
        );
    }

    /**
     * Delete fine type
     */
    public function destroy(FineType $fineType)
    {
        // Check if fine type is being used
        if ($fineType->fines()->count() > 0) {
            return ApiResponse::errorResponse(
                'Tipe denda ini masih digunakan dan tidak dapat dihapus',
                null,
                400
            );
        }

        ActivityLogger::log(
            'delete',
            'fine_type',
            "Fine type #{$fineType->id} deleted",
            [
                'fine_type_id' => $fineType->id,
                'name' => $fineType->name,
                'type' => $fineType->type,
            ],
            null,
            $fineType
        );

        $fineType->delete();

        return ApiResponse::successResponse(
            'Tipe denda berhasil dihapus'
        );
    }
}
