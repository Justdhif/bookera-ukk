<?php

namespace App\Services\Fine;

use App\Helpers\ActivityLogger;
use App\Models\Borrow;
use App\Models\FineBorrow;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\CoreApi;
use Midtrans\Notification;

class FineService
{
    public function __construct()
    {
        Config::$serverKey    = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized  = config('midtrans.is_sanitized');
        Config::$is3ds        = config('midtrans.is_3ds');
    }

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

    public function createMidtransTransaction(FineBorrow $fine, string $bank): array
    {
        $borrow = $fine->borrow;
        $user = $borrow->user;
        
        $orderId = 'FINE-' . $fine->id . '-' . time();
        $amount = (int) $fine->amount;

        $params = [
            'payment_type' => 'bank_transfer',
            'transaction_details' => [
                'order_id'     => $orderId,
                'gross_amount' => $amount,
            ],
            'customer_details' => [
                'first_name' => $user->profile?->full_name ?? 'User',
                'email'      => $user->email,
                'phone'      => $user->profile?->phone_number ?? '',
            ],
            'item_details' => [
                [
                    'id'       => 'FINE-' . $fine->id,
                    'price'    => $amount,
                    'quantity' => 1,
                    'name'     => 'Fine Payment for Borrow #' . $borrow->id,
                ],
            ],
            'bank_transfer' => [
                'bank' => $bank,
            ],
        ];

        try {
            $response = CoreApi::charge($params);
            
            $vaNumber = null;
            if (isset($response->va_numbers[0])) {
                $vaNumber = $response->va_numbers[0]->va_number;
            } elseif (isset($response->permata_va_number)) {
                $vaNumber = $response->permata_va_number;
            }

            $fine->update([
                'payment_method' => 'midtrans',
                'order_id' => $orderId,
                'va_number' => $vaNumber,
                'bank' => $bank,
                'payment_payload' => (array) $response,
            ]);

            return [
                'va_number' => $vaNumber,
                'bank'      => $bank,
                'amount'    => $amount,
                'order_id'  => $orderId,
                'expiry_time' => $response->expiry_time ?? null,
            ];
        } catch (\Exception $e) {
            Log::error('Midtrans Fine Error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function payCash(FineBorrow $fine): FineBorrow
    {
        $fine->update([
            'status' => 'paid',
            'paid_at' => now(),
            'payment_method' => 'cash'
        ]);

        ActivityLogger::log(
            'update',
            'fine',
            "Fine #{$fine->id} paid via Cash",
            [
                'fine_id' => $fine->id,
                'payment_method' => 'cash',
                'amount' => $fine->amount
            ],
            null,
            $fine
        );

        return $fine->load(['borrow.user.profile', 'fineType']);
    }

    public function handlePaymentNotification($payload): void
    {
        $payload = (object) $payload;
        $orderId = $payload->order_id;
        $transactionStatus = $payload->transaction_status;
        $paymentType = $payload->payment_type ?? null;

        $fine = FineBorrow::where('order_id', $orderId)->first();

        if ($fine) {
            if ($transactionStatus == 'settlement' || $transactionStatus == 'capture') {
                $fine->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                    'payment_method' => 'midtrans'
                ]);

                ActivityLogger::log(
                    'update',
                    'fine',
                    "Fine #{$fine->id} paid via Midtrans",
                    [
                        'fine_id' => $fine->id,
                        'order_id' => $orderId,
                        'payment_type' => $paymentType
                    ],
                    null,
                    $fine
                );
            } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
                $fine->update(['status' => 'unpaid']);
            }
        }
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
