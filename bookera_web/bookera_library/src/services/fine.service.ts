import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  Fine,
  FineListResponse,
  FineFilterParams,
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

  getByUser: () => api.get<ApiResponse<Fine[]>>("/my-fines"),

  markAsPaid: (id: number) =>
    api.post<ApiResponse<Fine>>(`/admin/fines/${id}/mark-paid`),
};
