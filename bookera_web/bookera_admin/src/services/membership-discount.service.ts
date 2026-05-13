import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  MembershipDiscount,
  MembershipDiscountFilterParams,
  MembershipDiscountListResponse,
} from "@/types/membership-discount";

export const membershipDiscountService = {
  getAll: (filters?: MembershipDiscountFilterParams) =>
    api.get<ApiResponse<MembershipDiscountListResponse>>("/membership-discounts", {
      params: filters,
    }),

  create: (payload: {
    discount_key_id: number;
    discount_percentage: number;
  }) => api.post<ApiResponse<MembershipDiscount>>("/membership-discounts", payload),

  update: (
    id: number,
    payload: {
      discount_percentage: number;
    },
  ) =>
    api.put<ApiResponse<MembershipDiscount>>(
      `/admin/membership-discounts/${id}`,
      payload,
    ),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/admin/membership-discounts/${id}`),

  getDiscountKeys: () =>
    api.get<ApiResponse<import("@/types/membership-discount").DiscountKeyListResponse>>("/discount-keys"),
};

