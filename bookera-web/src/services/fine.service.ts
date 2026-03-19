import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  Fine,
  FineType,
  FineListResponse,
  FineTypeListResponse,
  CreateFineTypePayload,
  UpdateFineTypePayload,
  CreateFinePayload,
  UpdateFinePayload,
  WaiveFinePayload,
  FineFilterParams,
} from "@/types/fine";

export const fineTypeService = {
  getAll: (params?: { type?: string; search?: string }) =>
    api.get<ApiResponse<FineTypeListResponse>>("/admin/fine-types", { params }),

  getById: (id: number) =>
    api.get<ApiResponse<FineType>>(`/admin/fine-types/${id}`),

  create: (payload: CreateFineTypePayload) =>
    api.post<ApiResponse<FineType>>("/admin/fine-types", payload),

  update: (id: number, payload: UpdateFineTypePayload) =>
    api.put<ApiResponse<FineType>>(`/admin/fine-types/${id}`, payload),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/admin/fine-types/${id}`),
};

export const fineService = {
  getAll: (filters?: FineFilterParams) =>
    api.get<ApiResponse<FineListResponse>>("/admin/fines", {
      params: filters,
    }),

  getById: (id: number) => api.get<ApiResponse<Fine>>(`/admin/fines/${id}`),

  getByLoan: (loanId: number) =>
    api.get<ApiResponse<Fine[]>>(`/loans/${loanId}/fines`),

  getByBorrow: (borrowId: number) =>
    api.get<ApiResponse<Fine[]>>(`/borrows/${borrowId}/fines`),

  getByUser: () => api.get<ApiResponse<Fine[]>>("/my-fines"),

  create: (loanId: number, payload: CreateFinePayload) =>
    api.post<ApiResponse<Fine>>(`/admin/fines/loans/${loanId}`, payload),

  update: (id: number, payload: UpdateFinePayload) =>
    api.put<ApiResponse<Fine>>(`/admin/fines/${id}`, payload),

  markAsPaid: (id: number) =>
    api.post<ApiResponse<Fine>>(`/admin/fines/${id}/mark-paid`),

  waive: (id: number, payload?: WaiveFinePayload) =>
    api.post<ApiResponse<Fine>>(`/admin/fines/${id}/waive`, payload),

  delete: (id: number) => api.delete<ApiResponse<null>>(`/admin/fines/${id}`),
};
