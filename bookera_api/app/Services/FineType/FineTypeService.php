<?php

namespace App\Services\FineType;

use App\Helpers\ActivityLogger;
use App\Models\FineType;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class FineTypeService
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = FineType::query();

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return $query->latest()->orderByDesc('id')->paginate($filters['per_page'] ?? 15);
    }

    public function create(array $data): FineType
    {
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

        return $fineType;
    }

    public function update(FineType $fineType, array $data): FineType
    {
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

        return $fineType;
    }

    public function delete(FineType $fineType): void
    {
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
    }

    public function canDelete(FineType $fineType): bool
    {
        return $fineType->fines()->count() === 0;
    }
}
