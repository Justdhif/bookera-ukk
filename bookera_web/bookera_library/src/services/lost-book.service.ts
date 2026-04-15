import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  LostBook,
  LostBookListResponse,
  LostBookFilterParams,
} from "@/types/lost-book";

export const lostBookService = {
  getAll: (filters?: LostBookFilterParams) =>
    api.get<ApiResponse<LostBookListResponse>>("/admin/lost-books", {
      params: filters,
    }),

  getById: (id: number) =>
    api.get<ApiResponse<LostBook>>(`/admin/lost-books/${id}`),

  create: (
    borrowId: number,
    data: {
      borrow_detail_ids: number[];
    },
  ) =>
    api.post<ApiResponse<any>>(`/borrows/${borrowId}/report-lost`, data),

  update: (
    id: number,
    data: {
      lost_date?: string;
      estimated_lost_date?: string;
      notes?: string;
    },
  ) => api.put<ApiResponse<LostBook>>(`/admin/lost-books/${id}`, data),

  finish: (id: number) =>
    api.post<ApiResponse<LostBook>>(`/admin/lost-books/${id}/finish`),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/admin/lost-books/${id}`),
};
