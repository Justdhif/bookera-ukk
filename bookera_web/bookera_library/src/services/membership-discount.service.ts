import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  MembershipDiscount,
  MembershipDiscountFilterParams,
  MembershipDiscountListResponse,
} from "@/types/membership-discount";

export const membershipDiscountService = {
  getAll: (filters?: MembershipDiscountFilterParams) =>
    api.get<ApiResponse<MembershipDiscountListResponse>>("/admin/membership-discounts", {
      params: filters,
    }),

  create: (payload: {
    discount_key: string;
    name: string;
    discount_percentage: number;
    description?: string;
  }) => api.post<ApiResponse<MembershipDiscount>>("/admin/membership-discounts", payload),

  update: (
    id: number,
    payload: {
      name: string;
      discount_percentage: number;
      description?: string;
    },
  ) =>
    api.put<ApiResponse<MembershipDiscount>>(
      `/admin/membership-discounts/${id}`,
      payload,
    ),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/admin/membership-discounts/${id}`),
};
