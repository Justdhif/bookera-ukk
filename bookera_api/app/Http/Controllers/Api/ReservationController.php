<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Services\Reservation\ReservationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    private ReservationService $reservationService;

    public function __construct(ReservationService $reservationService)
    {
        $this->reservationService = $reservationService;
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'search'   => $request->search,
            'status'   => $request->status,
            'book_id'  => $request->book_id,
            'per_page' => $request->per_page,
        ];

        $reservations = $this->reservationService->getAll($filters);

        return ApiResponse::successResponse('Reservation data retrieved successfully', $reservations);
    }

    // ─── User ─────────────────────────────────────────────────────────────────

    /**
     * Create a reservation for the authenticated user.
     * Body: { book_id: number }
     */
    public function store(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'member') {
            return ApiResponse::forbiddenResponse('Only members can make reservations. Please upgrade your account.');
        }

        $reservation = $this->reservationService->create(
            (int) $request->book_id,
            $request->user()
        );

        // Send confirmation notification after transaction
        (new \App\Services\Reservation\ReservationNotificationService())->notifyReservationCreated($reservation);

        return ApiResponse::successResponse('Reservation created successfully', $reservation, 201);
    }

    /**
     * Get all active reservations for the current user.
     */
    public function myReservations(Request $request): JsonResponse
    {
        $reservations = $this->reservationService->getByUser($request->user());

        return ApiResponse::successResponse('User reservations retrieved', $reservations);
    }

    /**
     * Check reservation status for a specific book for the current user.
     */
    public function check(Request $request, int $bookId): JsonResponse
    {
        $reservation = $this->reservationService->checkForUser($bookId, $request->user());

        return ApiResponse::successResponse('Reservation status checked', [
            'has_reservation'    => $reservation !== null,
            'reservation'        => $reservation,
            'queue_position'     => $reservation?->queue_position,
            'status'             => $reservation?->status,
            'is_notified'        => $reservation?->status === 'notified',
        ]);
    }

    /**
     * Cancel / release a reservation.
     */
    public function cancel(Request $request, Reservation $reservation): JsonResponse
    {
        $reservation = $this->reservationService->cancel($reservation, $request->user());

        return ApiResponse::successResponse('Reservation cancelled successfully', $reservation);
    }


    /**
     * Get reservation prediction for a book.
     */
    public function prediction(int $bookId): JsonResponse
    {
        $result = $this->reservationService->getPrediction($bookId);

        return ApiResponse::successResponse('Prediction retrieved', $result);
    }
}
