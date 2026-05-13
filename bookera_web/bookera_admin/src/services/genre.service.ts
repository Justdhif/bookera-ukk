import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { Genre, GenreFilterParams, GenreListResponse } from "@/types/genre";

export const genreService = {
  getAll: (filters?: GenreFilterParams) =>
    api.get<ApiResponse<GenreListResponse>>("/admin/genres", {
      params: filters,
    }),

  create: (payload: { name: string; description?: string; icon?: string }) =>
    api.post<ApiResponse<Genre>>("/admin/genres", payload),

  update: (
    id: number,
    payload: {
      name: string;
      description?: string;
      icon?: string;
    },
  ) => api.put<ApiResponse<Genre>>(`/admin/genres/${id}`, payload),

  delete: (id: number) =>
    api.delete<ApiResponse<{ deleted_genre_id: number }>>(
      `/admin/genres/${id}`,
    ),
};

