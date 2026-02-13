<?php

namespace App\Services\PrivacyPolicy;

use App\Helpers\ActivityLogger;
use App\Models\PrivacyPolicy;
use Illuminate\Database\Eloquent\Collection;

class PrivacyPolicyService
{
    public function getAllPrivacyPolicies(): Collection
    {
        return PrivacyPolicy::orderBy('created_at', 'desc')->get();
    }

    public function createPrivacyPolicy(array $data): PrivacyPolicy
    {
        $privacyPolicy = PrivacyPolicy::create($data);

        ActivityLogger::log(
            'create',
            'privacy_policy',
            "Created Privacy Policy: {$privacyPolicy->title}",
            $privacyPolicy->toArray(),
            null,
            $privacyPolicy
        );

        return $privacyPolicy;
    }

    public function updatePrivacyPolicy(PrivacyPolicy $privacyPolicy, array $data): PrivacyPolicy
    {
        $oldData = $privacyPolicy->toArray();

        $privacyPolicy->update($data);

        ActivityLogger::log(
            'update',
            'privacy_policy',
            "Updated Privacy Policy: {$privacyPolicy->title}",
            $privacyPolicy->toArray(),
            $oldData,
            $privacyPolicy
        );

        return $privacyPolicy;
    }

    public function deletePrivacyPolicy(PrivacyPolicy $privacyPolicy): void
    {
        $oldData = $privacyPolicy->toArray();

        $privacyPolicy->delete();

        ActivityLogger::log(
            'delete',
            'privacy_policy',
            "Deleted Privacy Policy: {$oldData['title']}",
            null,
            $oldData
        );
    }
}
