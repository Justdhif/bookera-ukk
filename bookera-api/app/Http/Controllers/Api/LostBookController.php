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
        $lostBooks = $this->lostBookService->getAllLostBooks($request->search);

        return ApiResponse::successResponse('Data buku hilang', $lostBooks);
    }

    public function store(StoreLostBookRequest $request, Borrow $borrow): JsonResponse
    {
        $validated = $request->validated();
        [$canReport, $errorMessage] = $this->lostBookService->canReportLost($borrow, $validated['book_copy_id']);

        if (!$canReport) {
            return ApiResponse::errorResponse($errorMessage, null, 400);
        }

        $lostBook = $this->lostBookService->reportLostBook($borrow, $validated);

        return ApiResponse::successResponse('Buku hilang berhasil dilaporkan', $lostBook, 201);
    }

    public function show(LostBook $lostBook): JsonResponse
    {
        $lostBook->load(['borrow.user.profile', 'bookCopy.book']);

        return ApiResponse::successResponse('Detail buku hilang', $lostBook);
    }

    public function update(UpdateLostBookRequest $request, LostBook $lostBook): JsonResponse
    {
        $lostBook = $this->lostBookService->updateLostBook($lostBook, $request->validated());

        return ApiResponse::successResponse('Informasi buku hilang berhasil diupdate', $lostBook);
    }

    public function destroy(LostBook $lostBook): JsonResponse
    {
        $this->lostBookService->deleteLostBook($lostBook);

        return ApiResponse::successResponse('Record buku hilang berhasil dihapus');
    }

    public function finish(LostBook $lostBook): JsonResponse
    {
        [$canFinish, $errorMessage] = $this->lostBookService->canFinish($lostBook);

        if (!$canFinish) {
            return ApiResponse::errorResponse($errorMessage, null, 400);
        }

        $lostBook = $this->lostBookService->finishLostBookProcess($lostBook);

        return ApiResponse::successResponse('Proses buku hilang telah selesai. Status peminjaman diubah menjadi lost.', $lostBook);
    }

    public function processFine(LostBook $lostBook): JsonResponse
    {
        try {
            $fine = $this->lostBookService->processFine($lostBook);
            return ApiResponse::successResponse('Denda berhasil diproses', $fine, 201);
        } catch (\Exception $e) {
            return ApiResponse::errorResponse($e->getMessage(), null, 400);
        }
    }
}
