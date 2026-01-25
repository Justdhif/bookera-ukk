<?php

namespace App\Helpers;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class SlugGenerator
{
    /**
     * Generate unique slug berdasarkan field
     *
     * @param  string  $table
     * @param  string  $column
     * @param  string  $source
     * @param  int|null $ignoreId
     * @return string
     */
    public static function generate(
        string $table,
        string $column,
        string $source,
        int $ignoreId = null
    ): string {
        $slug = Str::slug($source);
        $originalSlug = $slug;
        $counter = 1;

        while (self::slugExists($table, $column, $slug, $ignoreId)) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    protected static function slugExists(
        string $table,
        string $column,
        string $slug,
        ?int $ignoreId
    ): bool {
        $query = DB::table($table)
            ->where($column, $slug);

        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }

        return $query->exists();
    }
}
