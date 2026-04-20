import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { BookReturn } from "@/types/book-return";

export const bookReturnService = {
  create: (
    borrowId: number,
    data: {
      borrow_detail_ids: number[];
    },
  ) =>
    api.post<ApiResponse<BookReturn>>(`/borrows/${borrowId}/return`, {
      items: data.borrow_detail_ids.map((borrowDetailId) => ({
        borrow_detail_id: borrowDetailId,
        status: "returned" as const,
        condition: "good" as const,
      })),
    }),

  getByBorrow: (borrowId: number) =>
    api.get<ApiResponse<BookReturn[]>>(`/borrows/${borrowId}/returns`),

  getById: (id: number) =>
    api.get<ApiResponse<BookReturn>>(`/book-returns/${id}`),

};
