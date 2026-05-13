import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { Reservation, ReservationCheckResponse } from "@/types/reservation";

export const reservationService = {
  /**
   * Reserve a book (only possible when out of stock).
   */
  reserve: (bookId: number) =>
    api.post<ApiResponse<Reservation>>("/reservations", { 
      book_id: bookId,
    }),

  /**
   * Get reservation prediction for a book.
   */
  getPrediction: (bookId: number) =>
    api.get<ApiResponse<{
      earliest_return: string | null;
      suggested_date: string;
      message: string;
    }>>(`/reservations/prediction/${bookId}`),

  /**
   * Cancel / release a reservation.
   */
  cancel: (reservationId: number) =>
    api.delete<ApiResponse<Reservation>>(`/reservations/${reservationId}`),

  /**
   * Check whether the current user has an active reservation for a given book.
   */
  check: (bookId: number) =>
    api.get<ApiResponse<ReservationCheckResponse>>(
      `/reservations/check/${bookId}`
    ),

  /**
   * Get all active reservations for the current user.
   */
  getMyReservations: () =>
    api.get<ApiResponse<Reservation[]>>("/my-reservations"),
};
