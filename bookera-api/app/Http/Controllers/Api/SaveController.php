<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Save\AddBookRequest;
use App\Http\Requests\Save\StoreSaveRequest;
use App\Http\Requests\Save\UpdateSaveRequest;
use App\Models\Save;
use App\Services\Save\SaveService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SaveController extends Controller
{
    private SaveService $saveService;

    public function __construct(SaveService $saveService)
    {
        $this->saveService = $saveService;
    }

    public function index(Request $request): JsonResponse
    {
        $saves = $this->saveService->getUserSaves($request->search, $request->per_page ?? 10);

        return ApiResponse::successResponse('Data simpanan berhasil diambil', $saves);
    }

    public function show(string $identifier): JsonResponse
    {
        $data = $this->saveService->getSaveByIdentifier($identifier);

        return ApiResponse::successResponse('Detail simpanan berhasil diambil', $data);
    }

    public function store(StoreSaveRequest $request): JsonResponse
    {
        $save = $this->saveService->createSave($request->validated());

        return ApiResponse::successResponse('Simpanan berhasil dibuat', $save, 201);
    }

    public function update(UpdateSaveRequest $request, int $id): JsonResponse
    {
        $save = Save::where('user_id', auth()->id())->findOrFail($id);

        $save = $this->saveService->updateSave($save, $request->validated());

        return ApiResponse::successResponse('Simpanan berhasil diperbarui', $save);
    }

    public function destroy(int $id): JsonResponse
    {
        $save = Save::where('user_id', auth()->id())->findOrFail($id);

        $this->saveService->deleteSave($save);

        return ApiResponse::successResponse('Simpanan berhasil dihapus', null);
    }

    public function addBook(AddBookRequest $request, int $id): JsonResponse
    {
        $save = Save::where('user_id', auth()->id())->findOrFail($id);

        if ($this->saveService->bookExistsInSave($save, $request->book_id)) {
            return ApiResponse::errorResponse('Buku sudah ada di simpanan ini', null, 400);
        }

        $this->saveService->addBookToSave($save, $request->book_id);

        return ApiResponse::successResponse('Buku berhasil ditambahkan ke simpanan', null);
    }

    public function removeBook(int $id, int $bookId): JsonResponse
    {
        $save = Save::where('user_id', auth()->id())->findOrFail($id);

        if (!$this->saveService->bookExistsInSave($save, $bookId)) {
            return ApiResponse::errorResponse('Buku tidak ditemukan di simpanan ini', null, 404);
        }

        $this->saveService->removeBookFromSave($save, $bookId);

        return ApiResponse::successResponse('Buku berhasil dihapus dari simpanan', null);
    }
}
