<?php

namespace App\Services\MembershipDiscount;

use App\Helpers\ActivityLogger;
use App\Models\MembershipDiscount;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class MembershipDiscountService
{
    public function getAll(array $filters): LengthAwarePaginator
    {
        $query = MembershipDiscount::query();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('discount_key', 'like', "%{$search}%");
            });
        }

        return $query->latest()->orderByDesc('id')->paginate($filters['per_page'] ?? 15);
    }

    public function create(array $data): MembershipDiscount
    {
        $discount = MembershipDiscount::create($data);

        ActivityLogger::log(
            'create',
            'membership_discount',
            "Created membership discount: {$discount->name}",
            $discount->toArray(),
            null,
            $discount
        );

        return $discount;
    }

    public function update(MembershipDiscount $discount, array $data): MembershipDiscount
    {
        $oldData = $discount->toArray();

        $discount->update($data);

        ActivityLogger::log(
            'update',
            'membership_discount',
            "Updated membership discount: {$discount->name}",
            $discount->toArray(),
            $oldData,
            $discount
        );

        return $discount;
    }

    public function delete(MembershipDiscount $discount): array
    {
        $deletedId = $discount->id;
        $discountData = $discount->toArray();
        $discountName = $discount->name;

        $discount->delete();

        ActivityLogger::log(
            'delete',
            'membership_discount',
            "Deleted membership discount: {$discountName}",
            null,
            $discountData,
            null
        );

        return ['deleted_id' => $deletedId];
    }
}
