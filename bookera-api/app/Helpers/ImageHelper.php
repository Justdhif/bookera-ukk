<?php

if (! function_exists('storage_image')) {
    /**
     * Generate full URL for storage image
     */
    function storage_image(?string $path, ?string $default = null): ?string
    {
        if (! $path) {
            return $default;
        }

        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }

        return asset('storage/'.ltrim($path, '/'));
    }
}
