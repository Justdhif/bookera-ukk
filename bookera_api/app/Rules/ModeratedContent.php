<?php

namespace App\Rules;

use App\Services\AI\ChatModerationService;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ModeratedContent implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (empty($value)) {
            return;
        }

        $moderationService = new ChatModerationService();
        $result = $moderationService->moderate($value, app()->getLocale());

        if ($result['is_inappropriate']) {
            $fail($result['reason'] ?: __('This content contains inappropriate language.'));
        }
    }
}
