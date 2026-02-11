import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { Save, SaveFormData, PaginatedSaveResponse } from "@/types/save";

export const saveService = {
  getAll: (params?: { search?: string; per_page?: number; page?: number }) =>
    api.get<ApiResponse<PaginatedSaveResponse>>("/saves", { params }),

  getOne: (id: number) => api.get<ApiResponse<Save>>(`/saves/${id}`),

  create: (data: SaveFormData) =>
    api.post<ApiResponse<Save>>("/saves", data),

  update: (id: number, data: SaveFormData) =>
    api.put<ApiResponse<Save>>(`/saves/${id}`, data),

  delete: (id: number) => api.delete<ApiResponse<null>>(`/saves/${id}`),

  addBook: (saveId: number, bookId: number) =>
    api.post<ApiResponse<null>>(`/saves/${saveId}/books`, { book_id: bookId }),

  removeBook: (saveId: number, bookId: number) =>
    api.delete<ApiResponse<null>>(`/saves/${saveId}/books/${bookId}`),
};
