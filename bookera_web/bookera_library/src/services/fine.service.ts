import api from "@/lib/axios";
import { ApiResponse, PaginatedResponse } from "@/types/api";
import {
  Fine,
  FineListResponse,
  FineFilterParams,
  FineBorrowGroup,
} from "@/types/fine";

export const fineService = {
  getAll: (filters?: FineFilterParams) =>
    api.get<ApiResponse<FineListResponse>>("/admin/fines", {
      params: filters,
    }),

  exportData: (filters?: FineFilterParams) =>
    api.get("/admin/fines/export", {
      params: filters,
      responseType: "blob",
    }),

  getByBorrow: (borrowId: number) =>
    api.get<ApiResponse<Fine[]>>(`/borrows/${borrowId}/fines`),

  getByUser: (filters?: FineFilterParams) =>
    api.get<ApiResponse<PaginatedResponse<FineBorrowGroup> | FineBorrowGroup[]>>(
      "/my-fines",
      {
        params: filters,
      },
    ),

  markAsPaid: (id: number) =>
    api.post<ApiResponse<Fine>>(`/admin/fines/${id}/mark-paid`),
};
