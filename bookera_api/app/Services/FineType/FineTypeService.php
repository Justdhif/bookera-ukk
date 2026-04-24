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

    public function update(FineType $fineType, array $data): FineType
    {
        $oldData = $fineType->toArray();
        $fineType->update($this->normalizeUpdateData($fineType, $data));

        ActivityLogger::log(
            'update',
            'fine_type',
            "Fine type #{$fineType->id} updated",
            [
                'fine_type_id' => $fineType->id,
                'name' => $fineType->name,
                'type' => $fineType->type,
                'amount' => $fineType->amount,
                'percentage' => $fineType->percentage,
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
                'percentage' => $fineType->percentage,
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

    private function normalizeCreateData(array $data): array
    {
        if (($data['type'] ?? null) === 'damaged') {
            $data['amount'] = 0;
            $data['percentage'] = (float) ($data['percentage'] ?? 0);
        } else {
            $data['percentage'] = null;
            $data['amount'] = (float) ($data['amount'] ?? 0);
        }

        return $data;
    }

    private function normalizeUpdateData(FineType $fineType, array $data): array
    {
        $type = $data['type'] ?? $fineType->type;

        if ($type === 'damaged') {
            $data['amount'] = 0;

            if (array_key_exists('percentage', $data)) {
                $data['percentage'] = (float) $data['percentage'];
            } elseif ($fineType->type === 'damaged') {
                $data['percentage'] = (float) $fineType->percentage;
            } else {
                $data['percentage'] = 0;
            }
        } else {
            if (array_key_exists('amount', $data)) {
                $data['amount'] = (float) $data['amount'];
            } elseif ($fineType->type !== 'damaged') {
                $data['amount'] = (float) $fineType->amount;
            }

            $data['percentage'] = null;
        }

        return $data;
    }
}
