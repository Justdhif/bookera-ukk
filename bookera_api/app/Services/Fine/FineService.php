<?php

namespace App\Services\Fine;

use App\Helpers\ActivityLogger;
use App\Models\Borrow;
use App\Models\FineBorrow;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class FineService
{
    public function getAll(array $filters): LengthAwarePaginator
    {
        return $this->buildQuery($filters)->paginate($filters['per_page'] ?? 15);
    }

    public function getExportData(array $filters): Collection
    {
        return $this->buildQuery($filters)->get();
    }

    public function getBorrowFines(Borrow $borrow): Collection
    {
        return FineBorrow::with(['fineType'])
            ->where('borrow_id', $borrow->id)
            ->orderBy('id')
            ->get();
    }

    private function buildQuery(array $filters)
    {
        $query = FineBorrow::with(['borrow.user.profile', 'fineType']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
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

        if (!empty($filters['start_date'])) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }

        return $query->orderBy('borrow_id')->orderBy('id');
    }

    public function getMyFines(int $userId, array $filters = []): LengthAwarePaginator|Collection
    {
        $query = Borrow::with(['fines.fineType', 'borrowDetails.bookCopy.book', 'fines.borrow'])
            ->where('user_id', $userId)
            ->whereHas('fines', function ($q) use ($filters) {
                if (!empty($filters['status'])) {
                    $q->where('status', $filters['status']);
                }
                
                if (!empty($filters['search'])) {
                    $search = $filters['search'];
                    $q->where(function ($sub) use ($search) {
                        $sub->where('id', 'like', "%{$search}%")
                            ->orWhereHas('fineType', function ($fineTypeQuery) use ($search) {
                                $fineTypeQuery->where('name', 'like', "%{$search}%");
                            });
                    });
                }
            });

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('borrow_code', 'like', "%{$search}%")
                    ->orWhereHas('borrowDetails.bookCopy.book', function ($bookQuery) use ($search) {
                        $bookQuery->where('title', 'like', "%{$search}%");
                    });
            });
        }

        if (!empty($filters['start_date'])) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }

        $query->orderBy('id', 'asc');

        if (isset($filters['per_page'])) {
            $paginator = $query->paginate($filters['per_page']);
            
            $paginator->getCollection()->transform(function ($borrow) use ($filters) {
                $fines = $borrow->fines;
                if (!empty($filters['status'])) {
                    $fines = $fines->where('status', $filters['status']);
                }

                return [
                    'borrowId' => $borrow->id,
                    'borrow' => $borrow,
                    'fines' => $fines->values()
                ];
            });

            return $paginator;
        }

        return $query->get()->map(function ($borrow) use ($filters) {
            $fines = $borrow->fines;
            if (!empty($filters['status'])) {
                $fines = $fines->where('status', $filters['status']);
            }

            return [
                'borrowId' => $borrow->id,
                'borrow' => $borrow,
                'fines' => $fines->values()
            ];
        });
    }

    public function markAsPaid(FineBorrow $fine): FineBorrow
    {
        $oldStatus = $fine->status;

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
                'borrow_id' => $fine->borrow_id,
                'status' => 'paid',
                'paid_at' => $fine->paid_at,
            ],
            ['status' => $oldStatus],
            $fine
        );

        return $fine->load(['borrow.user.profile', 'fineType']);
    }

    public function canMarkAsPaid(FineBorrow $fine): bool
    {
        return $fine->status === 'unpaid';
    }
}
