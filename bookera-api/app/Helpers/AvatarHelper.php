<?php

namespace App\Helpers;

class AvatarHelper
{
    /**
     * Generate DiceBear avatar URL with unique background color based on user ID
     *
     * @param int $userId
     * @return string
     */
    public static function generateDefaultAvatar(int $userId): string
    {
        // Array of background color combinations
        $backgroundColors = [
            'b6e3f4,c7d2fe,ddd6fe', // Blue variations
            'fde68a,fcd34d,fbbf24', // Yellow variations
            'fbcfe8,f9a8d4,f472b6', // Pink variations
            'a7f3d0,6ee7b7,34d399', // Green variations
            'fca5a5,f87171,ef4444', // Red variations
            'fed7aa,fdba74,fb923c', // Orange variations
            'c4b5fd,a78bfa,8b5cf6', // Purple variations
            'a5f3fc,67e8f9,22d3ee', // Cyan variations
            'd9f99d,bef264,a3e635', // Lime variations
            'fda4af,fb7185,f43f5e', // Rose variations
        ];

        // Use modulo to select color
        $colorIndex = $userId % count($backgroundColors);
        $backgroundColor = $backgroundColors[$colorIndex];

        return "https://api.dicebear.com/7.x/bottts/png?seed={$userId}&backgroundColor={$backgroundColor}";
    }
}
