import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { DiscountKey, DiscountKeyFilterParams, DiscountKeyListResponse } from "@/types/membership-discount";

export const discountKeyService = {
  getAll: (params?: DiscountKeyFilterParams) =>
    api.get<ApiResponse<DiscountKeyListResponse>>("/admin/discount-keys", { params }),

  create: (payload: {
    key: string;
    name: string;
    description?: string;
  }) => api.post<ApiResponse<DiscountKey>>("/admin/discount-keys", payload),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/admin/discount-keys/${id}`),
};
