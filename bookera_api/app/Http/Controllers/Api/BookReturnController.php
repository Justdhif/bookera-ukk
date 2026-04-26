<?php

namespace App\Http\Controllers\Api;

use App\Exports\BookReturnExport;
use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\BookReturn\StoreBookReturnRequest;
use App\Models\BookReturn;
use App\Models\Borrow;
use App\Services\BookReturn\BookReturnService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class BookReturnController extends Controller
{
    private BookReturnService $bookReturnService;

    public function __construct(BookReturnService $bookReturnService)
    {
        $this->bookReturnService = $bookReturnService;
    }

    public function index(Borrow $borrow): JsonResponse
    {
        $returns = BookReturn::with([
            'bookCopy.book.authors',
            'bookCopy.book.publishers',
            'bookCopy.book.categories',
            'bookCopy.book.genres',
            'borrow.user.profile',
            'borrow.fines.fineType',
        ])
            ->whereNotNull('book_copy_id')
            ->where('borrow_id', $borrow->id)
            ->orderByDesc('return_date')
            ->orderByDesc('id')
            ->get();

        return ApiResponse::successResponse('Book return data retrieved successfully', $returns);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $filters = $this->getFilters($request);
        $returns = $this->bookReturnService->getAll($filters);

        return ApiResponse::successResponse('Book return data retrieved successfully', $returns);
    }

    public function store(StoreBookReturnRequest $request, Borrow $borrow): JsonResponse
    {
        if ($borrow->status !== 'open') {
            return ApiResponse::errorResponse('This borrow is not in open status', null, 400);
        }

        $bookReturn = $this->bookReturnService->confirmReturn($borrow, $request->validated());

        return ApiResponse::successResponse('Book return confirmed successfully', $bookReturn, 201);
    }

    public function show(BookReturn $bookReturn): JsonResponse
    {
        $detail = $bookReturn->load([
            'bookCopy.book.authors',
            'bookCopy.book.publishers',
            'bookCopy.book.categories',
            'bookCopy.book.genres',
            'borrow.user.profile',
            'borrow.fines.fineType',
        ]);

        return ApiResponse::successResponse('Book return details', $detail);
    }

    public function export(Request $request): BinaryFileResponse
    {
        $filters = $this->getFilters($request);

        return Excel::download(
            new BookReturnExport($this->bookReturnService->getAll($filters, false)),
            'returns_data_' . now()->format('Y-m-d_H-i-s') . '.xlsx'
        );
    }

    private function getFilters(Request $request): array
    {
        return [
            'search' => $request->search,
            'per_page' => $request->per_page,
            'page' => $request->page,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
        ];
    }

}