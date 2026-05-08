import { MembershipDiscount } from "./membership-discount";
import { PaginatedResponse } from "./api";
import { Borrow } from "./borrow";

export interface FineType {
  id: number;
  name: string;
  type: "lost" | "damaged" | "late";
  amount: number;
  percentage?: number | null;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Fine {
  id: number;
  borrow_id: number;
  fine_type_id: number;
  amount: number;
  original_amount?: number;
  discount_amount?: number;
  paid_at?: string;
  status: "unpaid" | "paid" | "waived";
  notes?: string;
  waive_reason?: string;
  payment_method?: "cash" | "midtrans";
  order_id?: string;
  snap_token?: string;
  created_at: string;
  updated_at: string;
  fine_type?: FineType;
  borrow?: Borrow;
  membership_discount?: MembershipDiscount;
}

export interface FineBorrowGroup {
  borrowId: number;
  borrow?: Borrow;
  fines: Fine[];
}

export interface CreateFineTypePayload {
  name: string;
  type: "lost" | "damaged" | "late";
  amount: number;
  percentage?: number;
  description?: string;
}

export interface UpdateFineTypePayload {
  name?: string;
  type?: "lost" | "damaged" | "late";
  amount?: number;
  percentage?: number;
  description?: string;
}

export interface CreateFinePayload {
  fine_type_id: number;
  amount?: number;
  notes?: string;
}

export interface UpdateFinePayload {
  amount?: number;
  notes?: string;
}

export interface WaiveFinePayload {
  notes?: string;
}

export type FineTypeListResponse = PaginatedResponse<FineType>;
export type FineListResponse = PaginatedResponse<Fine>;

export interface FineFilterParams {
  search?: string;
  status?: string;
  per_page?: number;
  page?: number;
  start_date?: string;
  end_date?: string;
}
