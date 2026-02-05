import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { TermsOfService, TermsOfServiceFormData } from "@/types/terms-of-service";

export const termsOfServiceService = {
  getAll: () => api.get<ApiResponse<TermsOfService[]>>("/terms-of-services"),

  getById: (id: number) =>
    api.get<ApiResponse<TermsOfService>>(`/terms-of-services/${id}`),

  // Admin endpoints
  create: (payload: TermsOfServiceFormData) =>
    api.post<ApiResponse<TermsOfService>>(
      "/admin/terms-of-services",
      payload,
    ),

  update: (id: number, payload: TermsOfServiceFormData) =>
    api.put<ApiResponse<TermsOfService>>(
      `/admin/terms-of-services/${id}`,
      payload,
    ),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/admin/terms-of-services/${id}`),
};
