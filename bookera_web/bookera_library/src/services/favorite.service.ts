import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  BookFavorite,
  FavoriteCheckResponse,
  PaginatedFavoriteResponse,
} from "@/types/favorite";

export const favoriteService = {
  getAll: (params?: {
    per_page?: number;
    page?: number;
    search?: string;
    category_id?: number;
  }) =>
    api.get<ApiResponse<PaginatedFavoriteResponse>>("/favorites", { params }),

  add: (bookId: number) =>
    api.post<ApiResponse<BookFavorite>>("/favorites", { book_id: bookId }),

  remove: (bookId: number) =>
    api.delete<ApiResponse<null>>(`/favorites/${bookId}`),

  check: (bookId: number) =>
    api.get<ApiResponse<FavoriteCheckResponse>>(`/favorites/check/${bookId}`),
};
