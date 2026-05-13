import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  BorrowRequest,
  BorrowRequestListResponse,
} from "@/types/borrow-request";
import { Borrow } from "@/types/borrow";

export const borrowRequestService = {
  create: (data: {
    items: { id: number; quantity: number }[];
    borrow_date: string;
    return_date: string;
  }) => api.post<ApiResponse<BorrowRequest>>("/borrow-requests", data),

  getById: (id: number, isAdmin = false) =>
    api.get<ApiResponse<BorrowRequest>>(
      isAdmin ? `/admin/borrows/requests/${id}` : `/borrow-requests/${id}`,
    ),

  getByUser: (filters?: {
    search?: string;
    per_page?: number;
    page?: number;
    start_date?: string;
    end_date?: string;
  }) =>
    api.get<ApiResponse<BorrowRequestListResponse | BorrowRequest[]>>(
      "/my-borrow-requests",
      {
        params: filters,
      },
    ),
  
  cancel: (id: number) => api.patch(`/borrow-requests/${id}/cancel`),

  getAll: (filters?: {
    search?: string;
    approval_status?: string;
    per_page?: number;
    page?: number;
    start_date?: string;
    end_date?: string;
  }) =>
    api.get<ApiResponse<BorrowRequestListResponse>>("/borrows/requests", {
      params: filters,
    }),

  exportData: (filters?: {
    search?: string;
    approval_status?: string;
    start_date?: string;
    end_date?: string;
  }) =>
    api.get("/borrows/requests/export", {
      params: filters,
      responseType: "blob",
    }),

  assignBorrow: (id: number, copyIds: number[] | Record<number, number> = []) =>
    api.post<ApiResponse<Borrow>>(`/admin/borrows/requests/${id}/assign`, {
      copy_ids: copyIds,
    }),

  approve: (id: number, detailId: number) =>
    api.patch<ApiResponse<BorrowRequest>>(`/admin/borrows/requests/${id}/approve`, {
      detail_id: detailId,
    }),

  reject: (id: number, detailId: number, rejectReason?: string) =>
    api.patch<ApiResponse<BorrowRequest>>(
      `/admin/borrows/requests/${id}/reject`,
      { detail_id: detailId, reject_reason: rejectReason },
    ),

};

