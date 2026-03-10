import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { Borrow, BorrowListResponse } from "@/types/borrow";

export interface BorrowFilterParams {
  search?: string;
  status?: string;
  per_page?: number;
  page?: number;
}

export const borrowService = {
  getAll: (filters?: BorrowFilterParams) =>
    api.get<ApiResponse<BorrowListResponse>>("/admin/borrows", {
      params: filters,
    }),

  create: (data: { book_copy_ids: number[]; return_date: string }) =>
    api.post<ApiResponse<Borrow>>("/borrows", data),

  createAdminBorrow: (data: {
    user_id: number;
    book_copy_ids: number[];
    borrow_date: string;
    return_date: string;
  }) => api.post<ApiResponse<Borrow>>("/admin/borrows", data),

  show: (id: number) => api.get<ApiResponse<Borrow>>(`/borrows/${id}`),

  showByCode: (code: string) =>
    api.get<ApiResponse<Borrow>>(`/borrows/code/${code}`),

  showAdminByCode: (code: string) =>
    api.get<ApiResponse<Borrow>>(`/admin/borrows/code/${code}`),

  assignCopies: (id: number, copyIds: number[]) =>
    api.post<ApiResponse<Borrow>>(`/admin/borrows/${id}/assign-copies`, {
      copy_ids: copyIds,
    }),

  getMyBorrows: () => api.get<ApiResponse<Borrow[]>>("/my-borrows"),
};
