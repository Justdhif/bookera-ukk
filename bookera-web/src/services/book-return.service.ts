import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { BookReturn } from "@/types/book-return";

export const bookReturnService = {
  
  create: (
    borrowId: number,
    data: {
      borrow_detail_ids: number[];
    }
  ) => api.post<ApiResponse<BookReturn>>(`/borrows/${borrowId}/return`, data),

  
  getByBorrow: (borrowId: number) =>
    api.get<ApiResponse<BookReturn[]>>(`/borrows/${borrowId}/returns`),

  
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
