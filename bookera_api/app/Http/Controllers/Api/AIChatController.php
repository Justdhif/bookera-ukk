<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\AIChat;
use App\Services\AI\AIChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AIChatController extends Controller
{
    private AIChatService $aiChatService;

    public function __construct(AIChatService $aiChatService)
    {
        $this->aiChatService = $aiChatService;
    }

    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $message = $request->input('message');
        $user    = Auth::user();

        if (!$user) {
            return ApiResponse::errorResponse('User tidak terautentikasi', 401);
        }

        $response = $this->aiChatService->generateResponse($message, $user);

        return ApiResponse::successResponse('Respons AI berhasil diambil', [
            'response' => $response,
        ]);
    }

    public function getHistory(): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return ApiResponse::errorResponse('User tidak terautentikasi', 401);
        }

        $history = AIChat::where('user_id', $user->id)
            ->orderBy('created_at', 'asc')
            ->get();

        return ApiResponse::successResponse('Riwayat percakapan berhasil diambil', [
            'history' => $history,
        ]);
    }

    public function clearHistory(): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return ApiResponse::errorResponse('User tidak terautentikasi', 401);
        }

        AIChat::where('user_id', $user->id)->delete();

        return ApiResponse::successResponse('Riwayat percakapan berhasil dihapus');
    }
}
