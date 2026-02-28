import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { BookReturn } from "@/types/book-return";

export const bookReturnService = {
  
  create: (
    loanId: number,
    data: {
      copies: Array<{
        book_copy_id: number;
        condition?: "good" | "damaged" | "lost";
      }>;
    }
  ) => api.post<ApiResponse<BookReturn>>(`/loans/${loanId}/return`, data),

  
  getByLoan: (loanId: number) =>
    api.get<ApiResponse<BookReturn[]>>(`/loans/${loanId}/returns`),

  
  show: (id: number) =>
    api.get<ApiResponse<BookReturn>>(`/book-returns/${id}`),

  
  approveReturn: (id: number) =>
    api.post<ApiResponse<BookReturn>>(
      `/admin/book-returns/${id}/approve`
    ),

  
  processFine: (id: number) =>
    api.post<ApiResponse<any>>(
      `/admin/book-returns/${id}/process-fine`
    ),
};
