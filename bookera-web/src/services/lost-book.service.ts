import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { LostBook } from "@/types/lost-book";

export const lostBookService = {
  /**
   * ADMIN - Get all lost books
   */
  getAll: (search?: string) =>
    api.get<ApiResponse<LostBook[]>>("/admin/lost-books", {
      params: { search },
    }),

  /**
   * ADMIN - Get lost book detail
   */
  show: (id: number) =>
    api.get<ApiResponse<LostBook>>(`/admin/lost-books/${id}`),

  /**
   * USER - Report a lost book
   */
  report: (loanId: number, data: {
    book_copy_id: number;
    estimated_lost_date?: string;
    notes?: string;
  }) =>
    api.post<ApiResponse<LostBook>>(`/loans/${loanId}/report-lost`, data),

  /**
   * ADMIN - Update lost book information
   */
  update: (id: number, data: {
    estimated_lost_date?: string;
    notes?: string;
  }) =>
    api.put<ApiResponse<LostBook>>(`/admin/lost-books/${id}`, data),

  /**
   * ADMIN - Finish lost book process (mark loan as lost)
   */
  finish: (id: number) =>
    api.post<ApiResponse<LostBook>>(`/admin/lost-books/${id}/finish`),

  /**
   * ADMIN - Delete lost book record
   */
  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/admin/lost-books/${id}`),
};
