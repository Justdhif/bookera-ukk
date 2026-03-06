<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Publisher\StorePublisherRequest;
use App\Http\Requests\Publisher\UpdatePublisherRequest;
use App\Models\Publisher;
use App\Services\Publisher\PublisherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublisherController extends Controller
{
    private PublisherService $publisherService;

    public function __construct(PublisherService $publisherService)
    {
        $this->publisherService = $publisherService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'search'    => $request->search,
            'is_active' => $request->has('is_active') ? filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN) : null,
            'per_page'  => $request->per_page,
        ];

        if (is_null($filters['is_active'])) {
            unset($filters['is_active']);
        }

        $publishers = $this->publisherService->getPublishers($filters);

        return ApiResponse::successResponse('Data penerbit berhasil diambil', $publishers);
    }

    public function list(): JsonResponse
    {
        $publishers = $this->publisherService->getAllPublishers();

        return ApiResponse::successResponse('Daftar penerbit berhasil diambil', $publishers);
    }

    public function store(StorePublisherRequest $request): JsonResponse
    {
        $publisher = $this->publisherService->createPublisher(
            $request->validated(),
            $request->file('photo')
        );

        return ApiResponse::successResponse('Penerbit berhasil ditambahkan', $publisher, 201);
    }

    public function show(Publisher $publisher): JsonResponse
    {
        $publisher = $this->publisherService->getPublisherById($publisher->id);

        if (!$publisher) {
            return ApiResponse::errorResponse('Penerbit tidak ditemukan', null, 404);
        }

        return ApiResponse::successResponse('Data penerbit berhasil diambil', $publisher);
    }

    public function update(UpdatePublisherRequest $request, Publisher $publisher): JsonResponse
    {
        $publisher = $this->publisherService->updatePublisher(
            $publisher,
            $request->validated(),
            $request->file('photo')
        );

        return ApiResponse::successResponse('Penerbit berhasil diperbarui', $publisher);
    }

    public function destroy(Publisher $publisher): JsonResponse
    {
        $data = $this->publisherService->deletePublisher($publisher);

        return ApiResponse::successResponse('Penerbit berhasil dihapus', $data);
    }
}
