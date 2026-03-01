<?php

namespace App\Services\Fine;

use App\Helpers\ActivityLogger;
use App\Models\Borrow;
use App\Models\Fine;
use App\Models\FineType;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class FineService
{
    public function getAllFines(?string $status = null, ?string $search = null): Collection
    {
        $query = Fine::with(['borrow.user.profile', 'fineType']);

        if ($status) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhere('borrow_id', 'like', "%{$search}%")
                    ->orWhereHas('borrow.user', function ($userQuery) use ($search) {
                        $userQuery->where('email', 'like', "%{$search}%")
                            ->orWhereHas('profile', function ($profileQuery) use ($search) {
                                $profileQuery->where('full_name', 'like', "%{$search}%");
                            });
                    })
                    ->orWhereHas('fineType', function ($fineTypeQuery) use ($search) {
                        $fineTypeQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        return $query->latest()->get();
    }

    public function getBorrowFines(Borrow $borrow): Collection
    {
        return Fine::with(['fineType'])
            ->where('borrow_id', $borrow->id)
            ->latest()
            ->get();
    }

    public function getMyFines(int $userId): Collection
    {
        return Fine::with(['fineType', 'borrow.borrowDetails.bookCopy.book'])
            ->whereHas('borrow', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->latest()
            ->get();
    }

    public function createFine(Borrow $borrow, array $data): Fine
    {
        $fineType = FineType::findOrFail($data['fine_type_id']);

        return DB::transaction(function () use ($borrow, $fineType, $data) {
            $amount = $data['amount'] ?? $fineType->amount;

            $fine = Fine::create([
                'borrow_id'    => $borrow->id,
                'fine_type_id' => $fineType->id,
                'amount'       => $amount,
                'status'       => 'unpaid',
                'notes'        => $data['notes'] ?? null,
            ]);

            ActivityLogger::log(
                'create',
                'fine',
                "Fine created for borrow #{$borrow->id} - {$fineType->name}",
                [
                    'fine_id'   => $fine->id,
                    'borrow_id' => $borrow->id,
                    'fine_type' => $fineType->name,
                    'amount'    => $amount,
                    'status'    => 'unpaid',
                ],
                null,
                $fine
            );

            return $fine->load(['borrow.user.profile', 'fineType']);
        });
    }

    public function updateFine(Fine $fine, array $data): Fine
    {
        $oldData = $fine->toArray();
        $fine->update($data);

        ActivityLogger::log(
            'update',
            'fine',
            "Fine #{$fine->id} updated",
            [
                'fine_id' => $fine->id,
                'amount' => $fine->amount,
                'notes' => $fine->notes,
            ],
            $oldData,
            $fine
        );

        return $fine->load(['borrow.user.profile', 'fineType']);
    }

    public function markAsPaid(Fine $fine): Fine
    {
        $fine->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        ActivityLogger::log(
            'update',
            'fine',
            "Fine #{$fine->id} marked as paid",
            [
                'fine_id' => $fine->id,
                'status' => 'paid',
                'paid_at' => $fine->paid_at,
            ],
            ['status' => 'unpaid'],
            $fine
        );

        return $fine->load(['borrow.user.profile', 'fineType']);
    }

    public function waiveFine(Fine $fine, ?string $notes = null): Fine
    {
        $oldStatus = $fine->status;

        $fine->update([
            'status' => 'waived',
            'notes' => $notes ?? $fine->notes,
        ]);

        ActivityLogger::log(
            'update',
            'fine',
            "Fine #{$fine->id} waived",
            [
                'fine_id' => $fine->id,
                'status' => 'waived',
                'notes' => $fine->notes,
            ],
            ['status' => $oldStatus],
            $fine
        );

        return $fine->load(['borrow.user.profile', 'fineType']);
    }

    public function deleteFine(Fine $fine): void
    {
        ActivityLogger::log(
            'delete',
            'fine',
            "Fine #{$fine->id} deleted",
            [
                    'fine_id'   => $fine->id,
                'borrow_id' => $fine->borrow_id,
                'fine_type' => $fine->fineType->name ?? 'Unknown',
                'amount' => $fine->amount,
            ],
            null,
            $fine
        );

        $fine->delete();
    }

    public function canMarkAsPaid(Fine $fine): bool
    {
        return $fine->status !== 'paid';
    }

    public function canWaive(Fine $fine): bool
    {
        return $fine->status !== 'waived';
    }
}
