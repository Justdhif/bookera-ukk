<?php

namespace App\Enums;

enum UserOccupation: string
{
    case Student = 'student';
    case Teacher = 'teacher';
    case Staff = 'staff';
    case External = 'external';
    case Other = 'other';

    public static function values(): array
    {
        return array_map(static fn (self $occupation) => $occupation->value, self::cases());
    }
}