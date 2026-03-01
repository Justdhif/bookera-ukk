import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { BorrowRequest } from "@/types/borrow-request";
import { Borrow } from "@/types/borrow";

export const borrowRequestService = {
  create: (data: { book_ids: number[]; borrow_date: string; return_date: string }) =>
    api.post<ApiResponse<BorrowRequest>>("/borrow-requests", data),

  show: (id: number) => api.get<ApiResponse<BorrowRequest>>(`/borrow-requests/${id}`),

  getMyRequests: () => api.get<ApiResponse<BorrowRequest[]>>("/my-borrow-requests"),

  cancelRequest: (id: number) => api.delete(`/borrow-requests/${id}`),

  // Admin
  getAll: (search?: string) =>
    api.get<ApiResponse<BorrowRequest[]>>("/admin/borrow-requests", { params: { search } }),

  showByCode: (code: string) =>
    api.get<ApiResponse<BorrowRequest>>(`/admin/borrow-requests/code/${code}`),

  assignBorrow: (id: number, copyIds: number[] = []) =>
    api.post<ApiResponse<Borrow>>(`/admin/borrow-requests/${id}/assign`, { copy_ids: copyIds }),

  destroy: (id: number) => api.delete(`/admin/borrow-requests/${id}`),
};
