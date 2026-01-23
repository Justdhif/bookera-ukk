<?php

namespace App\Helpers;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function successResponse(
        string $message = 'Success',
        $data = null,
        int $statusCode = 200
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }

    public static function errorResponse(
        string $message = 'Error',
        $data = null,
        int $statusCode = 400
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }

    public static function notFoundResponse(
        string $message = 'Not Found',
        $data = null,
        int $statusCode = 404
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }

    public static function unauthorizedResponse(
        string $message = 'Unauthorized',
        $data = null,
        int $statusCode = 401
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }

    public static function forbiddenResponse(
        string $message = 'Forbidden',
        $data = null,
        int $statusCode = 403
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }

    public static function serverErrorResponse(
        string $message = 'Server Error',
        $data = null,
        int $statusCode = 500
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }
}
