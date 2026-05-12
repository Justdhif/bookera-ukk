<?php

namespace App\Services\Membership;

use App\Models\Membership;
use App\Models\MembershipPlan;
use App\Models\MembershipTransaction;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class MembershipService
{
    public function activateMembership(User $user, string $planId, ?string $paymentType = 'cash', ?MembershipTransaction $transaction = null): Membership
    {
        $planModel = MembershipPlan::where('plan_id', $planId)->first();
        $expiresAt = null; // Lifetime access

        if ($transaction) {
            $transaction->update([
                'status'      => 'paid',
                'payment_type' => $paymentType,
                'paid_at'     => now(),
                'expires_at'  => $expiresAt,
            ]);
        }

        $user->update(['role' => 'member']);

        $memberCode = 'MBR-' . str_pad($user->id, 5, '0', STR_PAD_LEFT) . '-' . strtoupper(bin2hex(random_bytes(3)));

        // Create or update membership record
        $membership = Membership::updateOrCreate(
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

        return $membership;
    }

    public function generateQrCode(string $memberCode, int $membershipId): string
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
}
