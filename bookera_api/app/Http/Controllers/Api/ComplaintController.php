<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Complaint\StoreComplaintRequest;
use App\Http\Requests\Complaint\UpdateComplaintStatusRequest;
use App\Models\Complaint;
use App\Services\Complaint\ComplaintService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComplaintController extends Controller
{
    public function __construct(private ComplaintService $complaintService) {}

    public function index(Request $request): JsonResponse
    {
        $user = auth('sanctum')->user();

        $filters = [
            'category' => $request->get('category'),
            'status'   => $request->get('status'),
            'search'   => $request->get('search'),
            'sort'     => $request->get('sort'),
            'user_id'  => $request->get('user_id'),
        ];

        $complaints = $this->complaintService->getAll(
            $user,
            $filters,
            (int) $request->get('per_page', 15)
        );

        return ApiResponse::successResponse('Complaints retrieved successfully', $complaints);
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        try {
            $user = auth('sanctum')->user();
            $complaint = $this->complaintService->getBySlug($slug, $user);
            return ApiResponse::successResponse('Complaint retrieved successfully', $complaint);
        } catch (ModelNotFoundException) {
            return ApiResponse::notFoundResponse('Complaint not found');
        }
    }

    public function store(StoreComplaintRequest $request): JsonResponse
    {
        $user = $request->user();

        $complaint = $this->complaintService->create($user, [
            'title'       => $request->input('title'),
            'description' => $request->input('description'),
            'category'    => $request->input('category'),
            'images'      => $request->file('images'),
        ]);

        return ApiResponse::successResponse('Complaint submitted successfully', $complaint, 201);
    }

    public function updateStatus(UpdateComplaintStatusRequest $request, string $slug): JsonResponse
    {
        try {
            $complaint = Complaint::where('slug', $slug)->firstOrFail();
            $updated = $this->complaintService->updateStatus($complaint, $request->input('status'));

            return ApiResponse::successResponse('Complaint status updated successfully', $updated);
        } catch (ModelNotFoundException) {
            return ApiResponse::notFoundResponse('Complaint not found');
        }
    }

    public function destroy(Request $request, string $slug): JsonResponse
    {
        try {
            $user = $request->user();
            $complaint = Complaint::where('slug', $slug)->firstOrFail();
            $this->complaintService->delete($user, $complaint);

            return ApiResponse::successResponse('Complaint deleted successfully');
        } catch (ModelNotFoundException) {
            return ApiResponse::notFoundResponse('Complaint not found');
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, $e->getCode() ?: 400);
        }
    }
}
