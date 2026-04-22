<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\LostBook\StoreLostBookRequest;
use App\Http\Requests\LostBook\UpdateLostBookRequest;
use App\Models\Borrow;
use App\Models\LostBook;
use App\Services\LostBook\LostBookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LostBookController extends Controller
{
    private LostBookService $lostBookService;

    public function __construct(LostBookService $lostBookService)
    {
        $this->lostBookService = $lostBookService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'search'   => $request->search,
            'per_page' => $request->per_page,
        ];

        $lostBooks = $this->lostBookService->getAll($filters);

        return ApiResponse::successResponse('Data buku hilang', $lostBooks);
    }

    public function store(StoreLostBookRequest $request, Borrow $borrow): JsonResponse
    {
        $validated = $request->validated();
        try {
            $borrow = $this->lostBookService->markBorrowDetailsLost($borrow, $validated['borrow_detail_ids']);

            return ApiResponse::successResponse('Status buku hilang berhasil diperbarui', $borrow);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 400);
        }
    }



    public function destroy(LostBook $lostBook): JsonResponse
    {
        $this->lostBookService->delete($lostBook);

        return ApiResponse::successResponse('Record buku hilang berhasil dihapus');
    }
}
