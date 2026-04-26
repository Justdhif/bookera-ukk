<?php

namespace App\Http\Controllers\Api;

use App\Exports\LostBookExport;
use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\LostBook\StoreLostBookRequest;
use App\Models\Borrow;
use App\Models\LostBook;
use App\Services\LostBook\LostBookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class LostBookController extends Controller
{
    private LostBookService $lostBookService;

    public function __construct(LostBookService $lostBookService)
    {
        $this->lostBookService = $lostBookService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $this->getFilters($request);

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

    public function export(Request $request): BinaryFileResponse
    {
        $filters = $this->getFilters($request);

        return Excel::download(
            new LostBookExport($this->lostBookService->getExportData($filters)),
            'lost_books_data_' . now()->format('Y-m-d_H-i-s') . '.xlsx'
        );
    }

    private function getFilters(Request $request): array
    {
        return [
            'search' => $request->search,
            'borrow_status' => $request->borrow_status,
            'per_page' => $request->per_page,
            'page' => $request->page,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
        ];
    }
}
