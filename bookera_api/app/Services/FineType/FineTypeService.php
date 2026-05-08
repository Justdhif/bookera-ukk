<?php

namespace App\Services\FineType;

use App\Helpers\ActivityLogger;
use App\Models\FineType;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class FineTypeService
{
    public function getAll(array $filters): LengthAwarePaginator
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
        $fineType = FineType::create($this->normalizeCreateData($data));

        ActivityLogger::log(
            'create',
            'fine_type',
            "Fine type '{$fineType->name}' created",
            [
                'fine_type_id' => $fineType->id,
                'name' => $fineType->name,
                'type' => $fineType->type,
                'amount' => $fineType->amount,
                'percentage' => $fineType->percentage,
            ],
            null,
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
                'percentage' => $fineType->percentage,
            ],
            null,
            $fineType
        );

        $fineType->delete();
    }

    private function normalizeCreateData(array $data): array
    {
        $data['amount'] = (float) ($data['amount'] ?? 0);
        $data['percentage'] = isset($data['percentage']) ? (float) $data['percentage'] : null;

        return $data;
    }
}
