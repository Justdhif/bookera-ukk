<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Loan\StoreAdminLoanRequest;
use App\Http\Requests\Loan\StoreLoanRequest;
use App\Http\Requests\Loan\UpdateLoanRequest;
use App\Models\Loan;
use App\Services\Loan\LoanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoanController extends Controller
{
    private LoanService $loanService;

    public function __construct(LoanService $loanService)
    {
        $this->loanService = $loanService;
    }

    public function index(Request $request): JsonResponse
    {
        $loans = $this->loanService->getLoans($request->search);

        return ApiResponse::successResponse('Data peminjaman berhasil diambil', $loans);
    }

    public function store(StoreLoanRequest $request): JsonResponse
    {
        $loan = $this->loanService->createLoan(
            $request->validated(),
            $request->user()
        );

        return ApiResponse::successResponse(
            'Permintaan peminjaman berhasil dibuat dan menunggu persetujuan admin',
            $loan,
            201
        );
    }

    public function storeAdminLoan(StoreAdminLoanRequest $request): JsonResponse
    {
        $loan = $this->loanService->createAdminLoan(
            $request->validated(),
            $request->user()
        );

        return ApiResponse::successResponse(
            'Peminjaman langsung berhasil dibuat dengan status approved & borrowed',
            $loan,
            201
        );
    }

    public function show(Loan $loan): JsonResponse
    {
        $loan = $this->loanService->getLoanById($loan);

        return ApiResponse::successResponse('Detail peminjaman', $loan);
    }

    public function update(UpdateLoanRequest $request, Loan $loan): JsonResponse
    {
        $loan = $this->loanService->updateLoan($loan, $request->validated());

        return ApiResponse::successResponse('Peminjaman berhasil diupdate', $loan);
    }

    public function getLoanByUser(Request $request): JsonResponse
    {
        $loans = $this->loanService->getLoansByUser($request->user());

        return ApiResponse::successResponse('Data peminjaman user', $loans);
    }
}
