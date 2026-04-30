<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Services\Public\PublicService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    private PublicService $publicService;

    public function __construct(PublicService $publicService)
    {
        $this->publicService = $publicService;
    }

    /**
     * Display a listing of books.
     */
    public function books(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search', 'category_ids', 'genre_ids', 'rating', 'min_reviews',
            'status', 'has_stock', 'author_ids', 'publisher_ids',
            'per_page', 'page'
        ]);

        $books = $this->publicService->getAllBooks($filters);

        return ApiResponse::successResponse('Book data retrieved successfully', $books);
    }



    /**
     * Display the specified book by slug.
     */
    public function bookBySlug(Request $request, string $slug): JsonResponse
    {
        $book = $this->publicService->getBookBySlug($slug);

        if (!$book) {
            return ApiResponse::errorResponse('Book not found', null, 404);
        }

        $book = $this->injectReservationData($request, $book);

        return ApiResponse::successResponse('Book details', $book);
    }

    /**
     * Display the specified book by ID.
     */
    public function bookById(Request $request, int $id): JsonResponse
    {
        $book = $this->publicService->getBookById($id);

        if (!$book) {
            return ApiResponse::errorResponse('Book not found', null, 404);
        }

        $book = $this->injectReservationData($request, $book);

        return ApiResponse::successResponse('Book details', $book);
    }

    /**
     * Display a listing of authors.
     */
    public function authors(Request $request): JsonResponse
    {
        $authors = $this->publicService->getAllAuthors($request->all());

        return ApiResponse::successResponse('Data penulis berhasil diambil', $authors);
    }



    /**
     * Display the specified author by slug.
     */
    public function authorBySlug(string $slug): JsonResponse
    {
        $author = $this->publicService->getAuthorBySlug($slug);

        if (!$author) {
            return ApiResponse::errorResponse('Penulis tidak ditemukan', null, 404);
        }

        return ApiResponse::successResponse('Data penulis berhasil diambil', $author);
    }

    /**
     * Display a listing of publishers.
     */
    public function publishers(Request $request): JsonResponse
    {
        $publishers = $this->publicService->getAllPublishers($request->all());

        return ApiResponse::successResponse('Data penerbit berhasil diambil', $publishers);
    }



    /**
     * Display the specified publisher by slug.
     */
    public function publisherBySlug(string $slug): JsonResponse
    {
        $publisher = $this->publicService->getPublisherBySlug($slug);

        if (!$publisher) {
            return ApiResponse::errorResponse('Penerbit tidak ditemukan', null, 404);
        }

        return ApiResponse::successResponse('Data penerbit berhasil diambil', $publisher);
    }

    /**
     * Display a listing of categories.
     */
    public function categories(Request $request): JsonResponse
    {
        $categories = $this->publicService->getAllCategories($request->all());

        return ApiResponse::successResponse('Data kategori berhasil diambil', $categories);
    }

    /**
     * Display a listing of public users.
     */
    public function users(Request $request): JsonResponse
    {
        $users = $this->publicService->getAllUsers($request->all());

        return ApiResponse::successResponse('Public user data retrieved successfully', $users);
    }

    /**
     * Display a listing of top discussions.
     */
    public function topDiscussions(): JsonResponse
    {
        $discussions = $this->publicService->getTopDiscussions(10);

        return ApiResponse::successResponse('Top discussions retrieved successfully', $discussions);
    }

    /**
     * Display a listing of all discussions.
     */
    public function discussions(): JsonResponse
    {
        $perPage = request('per_page', 12);
        $search = request('search');
        $discussions = $this->publicService->getAllDiscussions($perPage, $search);

        return ApiResponse::successResponse('Discussions retrieved successfully', $discussions);
    }

    /**
     * Get public statistics for the landing page.
     */
    public function publicStats(): JsonResponse
    {
        $stats = $this->publicService->getPublicStats();

        return ApiResponse::successResponse('Public stats retrieved successfully', $stats);
    }

    private function injectReservationData(Request $request, $book)
    {
        $user = auth('sanctum')->user();

        if (! $user) {
            $book->user_reservation         = null;
            $book->user_has_available_copy  = false;
        } else {
            $reservation = Reservation::where('user_id', $user->id)
                ->where('book_id', $book->id)
                ->whereIn('status', ['waiting', 'notified'])
                ->first();

            $book->user_reservation        = $reservation;
            $book->user_has_available_copy = $reservation?->status === 'notified';
        }

        // Eksklusivitas Salinan: Filter daftar copies yang dikirim ke frontend
        // Jika buku memiliki relasi 'copies' yang dimuat
        if ($book->relationLoaded('copies')) {
            $notifiedCount = Reservation::where('book_id', $book->id)->where('status', 'notified')->count();
            $rawAvailableCount = $book->copies->where('status', 'available')->count();
            $publicAvailableCount = max(0, $rawAvailableCount - $notifiedCount);
            
            $hasNotified = $book->user_has_available_copy ?? false;
            $reservedShown = false;

            $filteredCopies = $book->copies->filter(function ($copy) use ($hasNotified, &$publicAvailableCount, &$reservedShown) {
                if ($copy->status !== 'available') {
                    return true;
                }

                // Jika user ini pemegang reservasi yang sudah dinotifikasi, tampilkan 1 salinan untuknya
                if ($hasNotified && !$reservedShown) {
                    $reservedShown = true;
                    return true;
                }

                // Untuk salinan available lainnya, hanya tampilkan jika masih ada sisa stok publik
                if ($publicAvailableCount > 0) {
                    $publicAvailableCount--;
                    return true;
                }

                return false; // Sembunyikan salinan 'milik orang lain'
            });

            $book->setRelation('copies', $filteredCopies->values());
        }

        return $book;
    }
}
