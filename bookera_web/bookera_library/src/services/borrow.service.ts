import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  Borrow,
  BorrowFilterParams,
  BorrowListResponse,
  BorrowReturnRequestData,
} from "@/types/borrow";

export const borrowService = {
  getAll: (filters?: BorrowFilterParams) =>
    api.get<ApiResponse<BorrowListResponse>>("/admin/borrows", {
      params: filters,
    }),

  exportData: (filters?: BorrowFilterParams) =>
    api.get("/admin/borrows/export", {
      params: filters,
      responseType: "blob",
    }),

  create: (data: any, isAdmin = false) =>
    api.post<ApiResponse<Borrow>>(
      isAdmin ? "/admin/borrows" : "/borrows",
      data,
    ),

  getByCode: (code: string, isAdmin = false) =>
    api.get<ApiResponse<Borrow>>(
      isAdmin ? `/admin/borrows/code/${code}` : `/borrows/code/${code}`,
    ),

  assignCopies: (id: number, copyIds: number[]) =>
    api.post<ApiResponse<Borrow>>(`/admin/borrows/${id}/assign-copies`, {
      copy_ids: copyIds,
    }),

  getByUser: (filters?: BorrowFilterParams) =>
    api.get<ApiResponse<BorrowListResponse | Borrow[]>>("/my-borrows", {
      params: filters,
    }),

  confirmReturn: (id: number, data: BorrowReturnRequestData) =>
    api.post<ApiResponse<any>>(`/borrows/${id}/return`, data),

  reportLost: (id: number, data: { borrow_detail_ids: number[] }) =>
    api.post<ApiResponse<any>>(`/borrows/${id}/report-lost`, data),

  complete: (id: number) =>
    api.post<ApiResponse<Borrow>>(`/admin/borrows/${id}/complete`),
};
