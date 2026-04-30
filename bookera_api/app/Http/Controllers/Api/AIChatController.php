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
        $user    = $request->user('sanctum');

        if ($user && $user->role !== 'member') {
            return ApiResponse::forbiddenResponse('Only members can use the AI chat feature.');
        }

        $response = $this->aiChatService->generateResponse($message, $user, app()->getLocale());


        return ApiResponse::successResponse('Respons AI berhasil diambil', [
            'response' => $response,
        ]);
    }

    public function getHistory(Request $request): JsonResponse
    {
        $user = $request->user('sanctum');
        
        if (!$user) {
            return ApiResponse::successResponse('Riwayat percakapan kosong (Tamu)', [
                'history' => [],
            ]);
        }

        $history = AIChat::where('user_id', $user->id)
            ->orderBy('created_at', 'asc')
            ->get();

        return ApiResponse::successResponse('Riwayat percakapan berhasil diambil', [
            'history' => $history,
        ]);
    }

    public function clearHistory(Request $request): JsonResponse
    {
        $user = $request->user('sanctum');

        if (!$user) {
            return ApiResponse::successResponse('Riwayat percakapan berhasil dihapus');
        }

        AIChat::where('user_id', $user->id)->delete();

        return ApiResponse::successResponse('Riwayat percakapan berhasil dihapus');
    }
}
