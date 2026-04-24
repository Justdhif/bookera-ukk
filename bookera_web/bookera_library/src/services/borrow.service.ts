import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { Borrow, BorrowListResponse, BorrowFilterParams } from "@/types/borrow";

interface BorrowReturnItemPayload {
  borrow_detail_id: number;
  status: "returned" | "lost";
  condition: "good" | "damaged" | null;
  fine_type_id?: number;
  lost_date?: string;
  notes?: string | null;
}

export const borrowService = {
  getAll: (filters?: BorrowFilterParams) =>
    api.get<ApiResponse<BorrowListResponse>>("/admin/borrows", {
      params: filters,
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
    api.get<ApiResponse<Borrow[]>>("/my-borrows", {
      params: filters,
    }),

  requestReturn: (id: number, data: { items: BorrowReturnItemPayload[] }) =>
    api.post<ApiResponse<any>>(`/borrows/${id}/return`, data),

  reportLost: (id: number, data: { borrow_detail_ids: number[] }) =>
    api.post<ApiResponse<any>>(`/borrows/${id}/report-lost`, data),

  complete: (id: number) =>
    api.post<ApiResponse<Borrow>>(`/admin/borrows/${id}/complete`),
};
