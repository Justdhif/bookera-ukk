import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { BookReturn } from "@/types/book-return";

export const bookReturnService = {
  /**
   * CREATE RETURN REQUEST
   */
  create: (
    loanId: number,
    data: {
      copies: Array<{
        book_copy_id: number;
        condition?: "good" | "damaged" | "lost";
      }>;
    }
  ) => api.post<ApiResponse<BookReturn>>(`/loans/${loanId}/return`, data),

  /**
   * GET RETURNS FOR A LOAN
   */
  getByLoan: (loanId: number) =>
    api.get<ApiResponse<BookReturn[]>>(`/loans/${loanId}/returns`),

  /**
   * DETAIL RETURN
   */
  show: (id: number) =>
    api.get<ApiResponse<BookReturn>>(`/book-returns/${id}`),

  /**
   * ADMIN - APPROVE RETURN (set loan to returned & book_copy to available)
   */
  approveReturn: (id: number) =>
    api.post<ApiResponse<BookReturn>>(
      `/admin/book-returns/${id}/approve`
    ),
};
