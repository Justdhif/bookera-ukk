<?php

namespace App\Services\FineType;

use App\Helpers\ActivityLogger;
use App\Models\FineType;
use Illuminate\Database\Eloquent\Collection;

class FineTypeService
{
    public function getAllFineTypes(?string $type = null, ?string $search = null): Collection
    {
        $query = FineType::query();

        if ($type) {
            $query->where('type', $type);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return $query->latest()->get();
    }

    public function createFineType(array $data): FineType
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

    public function updateFineType(FineType $fineType, array $data): FineType
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

    public function deleteFineType(FineType $fineType): void
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
