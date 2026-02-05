import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { PrivacyPolicy, PrivacyPolicyFormData } from "@/types/privacy-policy";

export const privacyPolicyService = {
  getAll: () => api.get<ApiResponse<PrivacyPolicy[]>>("/privacy-policies"),

  getById: (id: number) =>
    api.get<ApiResponse<PrivacyPolicy>>(`/privacy-policies/${id}`),

  // Admin endpoints
  create: (payload: PrivacyPolicyFormData) =>
    api.post<ApiResponse<PrivacyPolicy>>("/admin/privacy-policies", payload),

  update: (id: number, payload: PrivacyPolicyFormData) =>
    api.put<ApiResponse<PrivacyPolicy>>(
      `/admin/privacy-policies/${id}`,
      payload,
    ),

  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/admin/privacy-policies/${id}`),
};
