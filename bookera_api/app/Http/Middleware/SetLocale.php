<?php

namespace App\Http\Middleware;

use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cookie;

class SetLocale
{
    private const SUPPORTED_LOCALES = ['en', 'id'];

    public function handle(Request $request, Closure $next)
    {
        $locale = $this->resolveLocale($request);

        App::setLocale($locale);
        Carbon::setLocale($locale);

        if ($request->cookie('NEXT_LOCALE') !== $locale) {
            Cookie::queue('NEXT_LOCALE', $locale, 60 * 24 * 365, '/', null, $request->isSecure(), false, false, 'lax');
        }

        return $next($request);
    }

    private function resolveLocale(Request $request): string
    {
        foreach ([$request->header('X-Locale'), $request->cookie('NEXT_LOCALE'), $request->header('Accept-Language')] as $candidate) {
            $locale = $this->normalizeLocale($candidate);

            if ($locale !== null) {
                return $locale;
            }
        }

        return config('app.fallback_locale', 'en');
    }

    private function normalizeLocale(?string $candidate): ?string
    {
        if (! is_string($candidate) || $candidate === '') {
            return null;
        }

        $firstValue = strtolower(explode(',', $candidate)[0]);
        $baseLocale = explode(';', $firstValue)[0];
        $baseLocale = explode('-', $baseLocale)[0];

        return in_array($baseLocale, self::SUPPORTED_LOCALES, true)
            ? $baseLocale
            : null;
    }
}
