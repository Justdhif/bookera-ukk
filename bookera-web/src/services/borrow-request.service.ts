import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  BorrowRequest,
  BorrowRequestListResponse,
} from "@/types/borrow-request";
import { Borrow } from "@/types/borrow";

export const borrowRequestService = {
  create: (data: {
    book_ids: number[];
    borrow_date: string;
    return_date: string;
  }) => api.post<ApiResponse<BorrowRequest>>("/borrow-requests", data),

  getById: (id: number, isAdmin = false) =>
    api.get<ApiResponse<BorrowRequest>>(isAdmin ? `/admin/borrow-requests/${id}` : `/borrow-requests/${id}`),

  getByUser: () =>
    api.get<ApiResponse<BorrowRequest[]>>("/my-borrow-requests"),

  cancel: (id: number) => api.patch(`/borrow-requests/${id}/cancel`),

  getAll: (filters?: {
    search?: string;
    approval_status?: string;
    per_page?: number;
    page?: number;
  }) =>
    api.get<ApiResponse<BorrowRequestListResponse>>("/admin/borrow-requests", {
      params: filters,
    }),

  assignBorrow: (id: number, copyIds: number[] = []) =>
    api.post<ApiResponse<Borrow>>(`/admin/borrow-requests/${id}/assign`, {
      copy_ids: copyIds,
    }),

  approve: (id: number) =>
    api.patch<ApiResponse<Borrow>>(`/admin/borrow-requests/${id}/approve`),

  reject: (id: number, rejectReason?: string) =>
    api.patch<ApiResponse<BorrowRequest>>(
      `/admin/borrow-requests/${id}/reject`,
      { reject_reason: rejectReason },
    ),

  delete: (id: number) => api.delete(`/admin/borrow-requests/${id}`),
};
