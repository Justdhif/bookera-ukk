<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\MembershipTransaction;
use App\Models\MembershipPlan;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\CoreApi;
use Midtrans\Notification;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;

class MembershipController extends Controller
{
    public function __construct()
    {
        Config::$serverKey    = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized  = config('midtrans.is_sanitized');
        Config::$is3ds        = config('midtrans.is_3ds');
    }

    /**
     * Return available plans info (public, no auth needed)
     */
    public function plans(): JsonResponse
    {
        $plans = MembershipPlan::all()->map(function ($plan) {
            return [
                'id'          => $plan->plan_id,
                'name'        => $plan->name,
                'price'       => $plan->price,
                'description' => $plan->description,
            ];
        });

        return ApiResponse::successResponse('Membership plans', [
            'plans' => $plans,
        ]);
    }

    /**
     * Create a Midtrans Core API transaction for Bank Transfer (VA)
     */
    public function createTransaction(Request $request): JsonResponse
    {
        $request->validate([
            'plan' => 'required|exists:membership_plans,plan_id',
            'bank' => 'required|in:bca,bni,bri,cimb',
        ]);

        /** @var User $user */
        $user = $request->user();

        if ($user->role === 'member') {
            return ApiResponse::errorResponse('Anda sudah menjadi member.', 400);
        }

        $planType = $request->input('plan');
        $planModel = MembershipPlan::where('plan_id', $planType)->first();

        if (!$planModel) {
            return ApiResponse::errorResponse('Plan tidak ditemukan.', 404);
        }

        $amount = (int) $planModel->price;
        $orderId = 'MEMBER-' . $user->id . '-' . time();

        $transaction = MembershipTransaction::create([
            'user_id'  => $user->id,
            'order_id' => $orderId,
            'plan'     => $planType,
            'amount'   => $amount,
            'status'   => 'pending',
            'bank'     => $request->bank,
        ]);

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
                    'id'       => $planType,
                    'price'    => $amount,
                    'quantity' => 1,
                    'name'     => $planModel->name,
                ],
            ],
            'bank_transfer' => [
                'bank' => $request->bank,
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

            $transaction->update([
                'payment_type' => 'bank_transfer',
                'va_number' => $vaNumber,
                'payment_payload' => (array) $response,
            ]);

            return ApiResponse::successResponse('Transaksi VA berhasil dibuat', [
                'va_number' => $vaNumber,
                'bank'      => $request->bank,
                'amount'    => $amount,
                'order_id'  => $orderId,
                'expiry_time' => $response->expiry_time ?? null,
            ]);
        } catch (\Exception $e) {
            $transaction->update(['status' => 'failed']);
            Log::error('Midtrans error: ' . $e->getMessage());
            return ApiResponse::errorResponse('Gagal membuat transaksi: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Midtrans webhook / notification handler
     */
    public function handleNotification(Request $request): JsonResponse
    {
        try {
            $notification = new Notification();

            $transactionStatus = $notification->transaction_status;
            $orderId           = $notification->order_id;
            $fraudStatus       = $notification->fraud_status;
            $paymentType       = $notification->payment_type;

            $transaction = MembershipTransaction::where('order_id', $orderId)->first();

            if (! $transaction) {
                return response()->json(['message' => 'Transaction not found'], 404);
            }

            if ($transactionStatus == 'capture') {
                if ($fraudStatus == 'challenge') {
                    $transaction->update(['status' => 'pending', 'payment_type' => $paymentType]);
                } elseif ($fraudStatus == 'accept') {
                    $this->activateMembership($transaction, $paymentType);
                }
            } elseif ($transactionStatus == 'settlement') {
                $this->activateMembership($transaction, $paymentType);
            } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
                $transaction->update(['status' => 'failed', 'payment_type' => $paymentType]);
            } elseif ($transactionStatus == 'pending') {
                $transaction->update(['status' => 'pending', 'payment_type' => $paymentType]);
            }

            return response()->json(['message' => 'OK']);
        } catch (\Exception $e) {
            Log::error('Midtrans webhook error: ' . $e->getMessage());
            return response()->json(['message' => 'Error'], 500);
        }
    }

    private function activateMembership(MembershipTransaction $transaction, string $paymentType): void
    {
        $expiresAt = null; // Lifetime access

        $transaction->update([
            'status'      => 'paid',
            'payment_type' => $paymentType,
            'paid_at'     => now(),
            'expires_at'  => $expiresAt,
        ]);

        $user = User::find($transaction->user_id);
        $user->update(['role' => 'member']);

        $planModel = MembershipPlan::where('plan_id', $transaction->plan)->first();

        $memberCode = 'MBR-' . str_pad($user->id, 5, '0', STR_PAD_LEFT) . '-' . strtoupper(bin2hex(random_bytes(3)));

        // Create or update membership record
        $membership = \App\Models\Membership::updateOrCreate(
            ['user_id' => $user->id],
            [
                'membership_plan_id' => $planModel ? $planModel->id : 1,
                'member_code' => $memberCode,
                'joined_at' => now(),
                'expires_at' => $expiresAt,
                'status' => 'active',
            ]
        );

        $membership->update(['qr_code_path' => $this->generateQrCode($memberCode, $membership->id)]);
    }

    private function generateQrCode(string $memberCode, int $membershipId): string
    {
        Storage::disk('public')->makeDirectory('membership_qrs');

        $filename = 'member_' . $membershipId . '_' . $memberCode . '.png';
        $relativePath = 'membership_qrs/' . $filename;
        $absolutePath = storage_path('app/public/' . $relativePath);

        QrCode::format('png')
            ->size(300)
            ->errorCorrection('H')
            ->generate($memberCode, $absolutePath);

        return $relativePath;
    }

    /**
     * Check transaction status (polled by frontend after payment)
     */
    public function checkStatus(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $latestTransaction = MembershipTransaction::where('user_id', $user->id)
            ->latest()
            ->first();

        if ($latestTransaction && $latestTransaction->status === 'pending') {
            try {
                Log::info("Manual check for Order ID: " . $latestTransaction->order_id);
                $status = (object) \Midtrans\Transaction::status($latestTransaction->order_id);
                $transactionStatus = $status->transaction_status;
                $paymentType = $status->payment_type;
                
                Log::info("Midtrans Status for " . $latestTransaction->order_id . ": " . $transactionStatus);

                if ($transactionStatus == 'settlement' || ($transactionStatus == 'capture' && $status->fraud_status == 'accept')) {
                    $this->activateMembership($latestTransaction, $paymentType);
                    $latestTransaction->refresh();
                    Log::info("Membership activated via checkStatus for user: " . $user->id);
                } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
                    $latestTransaction->update(['status' => 'failed', 'payment_type' => $paymentType]);
                }
            } catch (\Exception $e) {
                Log::error("Midtrans status check error for " . ($latestTransaction->order_id ?? 'unknown') . ": " . $e->getMessage());
            }
        }

        return ApiResponse::successResponse('Transaction status', [
            'transaction' => $latestTransaction,
            'is_member'   => $user->fresh()->role === 'member',
        ]);
    }
}
