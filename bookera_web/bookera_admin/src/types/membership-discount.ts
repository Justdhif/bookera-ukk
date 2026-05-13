import { PaginatedResponse } from "./api";

export interface DiscountKey {
  id: number;
  key: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface MembershipDiscount {
  id: number;
  discount_key_id: number;
  discount_percentage: number;
  created_at: string;
  updated_at: string;
  discount_key?: DiscountKey;
}

export type MembershipDiscountListResponse = PaginatedResponse<MembershipDiscount>;

export interface MembershipDiscountFilterParams {
  search?: string;
  per_page?: number;
  page?: number;
}
 
export interface DiscountKeyFilterParams {
  search?: string;
  per_page?: number;
  page?: number;
}
 
export type DiscountKeyListResponse = PaginatedResponse<DiscountKey>;
