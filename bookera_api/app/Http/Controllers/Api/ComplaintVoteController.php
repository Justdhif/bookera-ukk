<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Services\Complaint\ComplaintVoteService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComplaintVoteController extends Controller
{
    public function __construct(private ComplaintVoteService $voteService) {}

    public function toggle(Request $request, string $slug): JsonResponse
    {
        try {
            $user = $request->user();
            $complaint = Complaint::where('slug', $slug)->firstOrFail();
            
            $result = $this->voteService->toggleVote($user, $complaint);

            $message = $result['is_voted'] 
                ? 'Complaint marked as helpful' 
                : 'Complaint helpful mark removed';

            return ApiResponse::successResponse($message, $result);
        } catch (ModelNotFoundException) {
            return ApiResponse::notFoundResponse('Complaint not found');
        }
    }
}
