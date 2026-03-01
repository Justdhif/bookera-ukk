import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { LostBook } from "@/types/lost-book";

export const lostBookService = {
  
  getAll: (search?: string) =>
    api.get<ApiResponse<LostBook[]>>("/admin/lost-books", {
      params: { search },
    }),

  
  show: (id: number) =>
    api.get<ApiResponse<LostBook>>(`/admin/lost-books/${id}`),

  
  report: (borrowId: number, data: {
    book_copy_id: number;
    notes?: string;
  }) =>
    api.post<ApiResponse<LostBook>>(`/borrows/${borrowId}/report-lost`, data),

  
  update: (id: number, data: {
    estimated_lost_date?: string;
    notes?: string;
  }) =>
    api.put<ApiResponse<LostBook>>(`/admin/lost-books/${id}`, data),

  
  finish: (id: number) =>
    api.post<ApiResponse<LostBook>>(`/admin/lost-books/${id}/finish`),

  
  processFine: (id: number) =>
    api.post<ApiResponse<any>>(`/admin/lost-books/${id}/process-fine`),

  
  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/admin/lost-books/${id}`),
};
