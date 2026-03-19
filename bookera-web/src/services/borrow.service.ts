import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { Borrow, BorrowListResponse, BorrowFilterParams } from "@/types/borrow";

export const borrowService = {
  getAll: (filters?: BorrowFilterParams) =>
    api.get<ApiResponse<BorrowListResponse>>("/admin/borrows", {
      params: filters,
    }),

  create: (data: any, isAdmin = false) =>
    api.post<ApiResponse<Borrow>>(isAdmin ? "/admin/borrows" : "/borrows", data),

  getById: (id: number) => api.get<ApiResponse<Borrow>>(`/borrows/${id}`),

  getByCode: (code: string, isAdmin = false) =>
    api.get<ApiResponse<Borrow>>(isAdmin ? `/admin/borrows/code/${code}` : `/borrows/code/${code}`),

  assignCopies: (id: number, copyIds: number[]) =>
    api.post<ApiResponse<Borrow>>(`/admin/borrows/${id}/assign-copies`, {
      copy_ids: copyIds,
    }),

  getByUser: () => api.get<ApiResponse<Borrow[]>>("/my-borrows"),
};
