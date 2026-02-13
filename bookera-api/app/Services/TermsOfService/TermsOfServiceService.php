<?php

namespace App\Services\TermsOfService;

use App\Helpers\ActivityLogger;
use App\Models\TermsOfService;
use Illuminate\Database\Eloquent\Collection;

class TermsOfServiceService
{
    public function getAllTermsOfServices(): Collection
    {
        return TermsOfService::orderBy('created_at', 'desc')->get();
    }

    public function createTermsOfService(array $data): TermsOfService
    {
        $termsOfService = TermsOfService::create($data);

        ActivityLogger::log(
            'create',
            'terms_of_service',
            "Created Terms of Service: {$termsOfService->title}",
            $termsOfService->toArray(),
            null,
            $termsOfService
        );

        return $termsOfService;
    }

    public function updateTermsOfService(TermsOfService $termsOfService, array $data): TermsOfService
    {
        $oldData = $termsOfService->toArray();

        $termsOfService->update($data);

        ActivityLogger::log(
            'update',
            'terms_of_service',
            "Updated Terms of Service: {$termsOfService->title}",
            $termsOfService->toArray(),
            $oldData,
            $termsOfService
        );

        return $termsOfService;
    }

    public function deleteTermsOfService(TermsOfService $termsOfService): void
    {
        $oldData = $termsOfService->toArray();

        $termsOfService->delete();

        ActivityLogger::log(
            'delete',
            'terms_of_service',
            "Deleted Terms of Service: {$oldData['title']}",
            null,
            $oldData
        );
    }
}
