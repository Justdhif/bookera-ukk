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

  create: (
    borrowId: number,
    data: {
      borrow_detail_ids: number[];
    },
  ) =>
    api.post<ApiResponse<any>>(`/borrows/${borrowId}/report-lost`, data),



  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/admin/lost-books/${id}`),
};
