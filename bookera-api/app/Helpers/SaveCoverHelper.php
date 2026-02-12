<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class SaveCoverHelper
{
    /**
     * Generate collage cover dari book covers (max 4, seperti Spotify)
     *
     * @param array $bookCoverPaths Array of book cover paths (max 4)
     * @param int $saveId ID of the save collection
     * @return string|null Path to the generated cover image
     */
    public static function generateCollage(array $bookCoverPaths, int $saveId): ?string
    {
        $coverCount = count($bookCoverPaths);

        if ($coverCount === 0) {
            return null;
        }

        // Filter out null/empty paths and limit to 4
        $bookCoverPaths = array_filter($bookCoverPaths);
        $bookCoverPaths = array_slice($bookCoverPaths, 0, 4);
        $coverCount = count($bookCoverPaths);

        if ($coverCount === 0) {
            return null;
        }

        $canvasSize = 800; // Size of the final collage

        try {
            // Create manager with GD driver
            $manager = new ImageManager(new Driver());

            // Create blank canvas
            $canvas = $manager->create($canvasSize, $canvasSize);
            $canvas = $canvas->fill('#e5e7eb');

            if ($coverCount === 1) {
                // Single cover - full size
                $cover = self::loadImage($manager, $bookCoverPaths[0], $canvasSize, $canvasSize);
                if ($cover) {
                    $canvas->place($cover, 'top-left', 0, 0);
                }
            } elseif ($coverCount === 2) {
                // Two covers - side by side
                $halfSize = (int)($canvasSize / 2);
                $cover1 = self::loadImage($manager, $bookCoverPaths[0], $halfSize, $canvasSize);
                $cover2 = self::loadImage($manager, $bookCoverPaths[1], $halfSize, $canvasSize);

                if ($cover1) $canvas->place($cover1, 'top-left', 0, 0);
                if ($cover2) $canvas->place($cover2, 'top-left', $halfSize, 0);
            } elseif ($coverCount === 3) {
                // Three covers - 2x2 grid with empty slot
                $halfSize = (int)($canvasSize / 2);
                $cover1 = self::loadImage($manager, $bookCoverPaths[0], $halfSize, $halfSize);
                $cover2 = self::loadImage($manager, $bookCoverPaths[1], $halfSize, $halfSize);
                $cover3 = self::loadImage($manager, $bookCoverPaths[2], $halfSize, $halfSize);

                if ($cover1) $canvas->place($cover1, 'top-left', 0, 0);
                if ($cover2) $canvas->place($cover2, 'top-left', $halfSize, 0);
                if ($cover3) $canvas->place($cover3, 'top-left', 0, $halfSize);
            } else {
                // Four covers - 2x2 grid
                $halfSize = (int)($canvasSize / 2);
                $cover1 = self::loadImage($manager, $bookCoverPaths[0], $halfSize, $halfSize);
                $cover2 = self::loadImage($manager, $bookCoverPaths[1], $halfSize, $halfSize);
                $cover3 = self::loadImage($manager, $bookCoverPaths[2], $halfSize, $halfSize);
                $cover4 = self::loadImage($manager, $bookCoverPaths[3], $halfSize, $halfSize);

                if ($cover1) $canvas->place($cover1, 'top-left', 0, 0);
                if ($cover2) $canvas->place($cover2, 'top-left', $halfSize, 0);
                if ($cover3) $canvas->place($cover3, 'top-left', 0, $halfSize);
                if ($cover4) $canvas->place($cover4, 'top-left', $halfSize, $halfSize);
            }

            // Save the collage
            $filename = "save_cover_{$saveId}_" . time() . '.jpg';
            $path = "saves/{$filename}";
            $fullPath = storage_path("app/public/{$path}");

            // Ensure directory exists
            if (!file_exists(dirname($fullPath))) {
                mkdir(dirname($fullPath), 0755, true);
            }

            // Encode and save
            $encoded = $canvas->toJpeg(90);
            file_put_contents($fullPath, $encoded);

            return $path;
        } catch (\Exception $e) {
            \Log::error('Failed to generate save cover collage: ' . $e->getMessage());
            \Log::error('Trace: ' . $e->getTraceAsString());
            return null;
        }
    }

    /**
     * Load and resize image from path
     *
     * @param ImageManager $manager
     * @param string $path
     * @param int $width
     * @param int $height
     * @return \Intervention\Image\Interfaces\ImageInterface|null
     */
    protected static function loadImage($manager, string $path, int $width, int $height)
    {
        try {
            // Convert relative path to absolute
            $fullPath = storage_path("app/public/{$path}");

            if (!file_exists($fullPath)) {
                \Log::warning("Image file not found: {$fullPath}");
                return null;
            }

            $image = $manager->read($fullPath);
            return $image->cover($width, $height);
        } catch (\Exception $e) {
            \Log::error('Failed to load image: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Delete old cover file
     *
     * @param string|null $coverPath
     * @return void
     */
    public static function deleteOldCover(?string $coverPath): void
    {
        if ($coverPath && Storage::disk('public')->exists($coverPath)) {
            Storage::disk('public')->delete($coverPath);
        }
    }
}
