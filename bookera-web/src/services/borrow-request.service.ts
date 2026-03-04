import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { BorrowRequest } from "@/types/borrow-request";
import { Borrow } from "@/types/borrow";

export const borrowRequestService = {
  create: (data: { book_ids: number[]; borrow_date: string; return_date: string }) =>
    api.post<ApiResponse<BorrowRequest>>("/borrow-requests", data),

  show: (id: number) => api.get<ApiResponse<BorrowRequest>>(`/borrow-requests/${id}`),

  getMyRequests: () => api.get<ApiResponse<BorrowRequest[]>>("/my-borrow-requests"),

  cancel: (id: number) => api.patch(`/borrow-requests/${id}/cancel`),

  // Admin
  getAll: (search?: string) =>
    api.get<ApiResponse<BorrowRequest[]>>("/admin/borrow-requests", { params: { search } }),

  adminShow: (id: number) => api.get<ApiResponse<BorrowRequest>>(`/admin/borrow-requests/${id}`),

  assignBorrow: (id: number, copyIds: number[] = []) =>
    api.post<ApiResponse<Borrow>>(`/admin/borrow-requests/${id}/assign`, { copy_ids: copyIds }),

  approve: (id: number) => api.patch<ApiResponse<Borrow>>(`/admin/borrow-requests/${id}/approve`),

  reject: (id: number, rejectReason?: string) =>
    api.patch<ApiResponse<BorrowRequest>>(`/admin/borrow-requests/${id}/reject`, { reject_reason: rejectReason }),

  destroy: (id: number) => api.delete(`/admin/borrow-requests/${id}`),
};
