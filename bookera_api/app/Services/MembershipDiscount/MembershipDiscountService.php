<?php

namespace App\Services\MembershipDiscount;

use App\Helpers\ActivityLogger;
use App\Models\MembershipDiscount;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class MembershipDiscountService
{
    public function getAll(array $filters): LengthAwarePaginator
    {
        $query = MembershipDiscount::with('discountKey');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('discountKey', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('key', 'like', "%{$search}%");
            });
        }

        return $query->latest()->orderByDesc('id')->paginate($filters['per_page'] ?? 15);
    }

    public function create(array $data): MembershipDiscount
    {
        $discount = MembershipDiscount::create($data);
        $discount->load('discountKey');

        ActivityLogger::log(
            'create',
            'membership_discount',
            "Created membership discount for: {$discount->discountKey->name}",
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
        $discount->load('discountKey');

        ActivityLogger::log(
            'update',
            'membership_discount',
            "Updated membership discount for: {$discount->discountKey->name}",
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
        $discount->load('discountKey');
        $discountName = $discount->discountKey->name;

        $discount->delete();

        ActivityLogger::log(
            'delete',
            'membership_discount',
            "Deleted membership discount for: {$discountName}",
            null,
            $discountData,
            null
        );

        return ['deleted_id' => $deletedId];
    }
}
