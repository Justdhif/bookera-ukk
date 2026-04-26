import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  CreateFineTypePayload,
  FineType,
  FineTypeListResponse,
} from "@/types/fine";

export const fineTypeService = {
  getAll: (params?: { type?: string; search?: string; per_page?: number; page?: number }) =>
    api.get<ApiResponse<FineTypeListResponse>>("/fine-types", { params }),

  create: (payload: CreateFineTypePayload) =>
    api.post<ApiResponse<FineType>>("/admin/fine-types", payload),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/admin/fine-types/${id}`),
};