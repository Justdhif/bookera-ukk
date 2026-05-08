import { PaginatedResponse } from "./api";

export interface MembershipDiscount {
  id: number;
  discount_key: string;
  name: string;
  discount_percentage: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export type MembershipDiscountListResponse = PaginatedResponse<MembershipDiscount>;

export interface MembershipDiscountFilterParams {
  search?: string;
  per_page?: number;
  page?: number;
}
