import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  BookReview,
  CreateReviewData,
  PaginatedReviewResponse,
  ReviewCheckResponse,
} from "@/types/review";

export const reviewService = {
  getByBookId: (bookId: number, params?: { per_page?: number; page?: number }) =>
    api.get<ApiResponse<PaginatedReviewResponse>>(`/books/${bookId}/reviews`, {
      params,
    }),

  submit: (data: CreateReviewData) =>
    api.post<ApiResponse<BookReview>>("/reviews", data),

  remove: (bookId: number) =>
    api.delete<ApiResponse<null>>(`/reviews/${bookId}`),

  check: (bookId: number) =>
    api.get<ApiResponse<ReviewCheckResponse>>(`/reviews/check/${bookId}`),
};
