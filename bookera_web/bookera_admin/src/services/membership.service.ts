import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";

export interface MembershipPlan {
  id: string | number;
  plan_id?: string;
  name: string;
  price: number;
  description: string;
}

export interface MembershipTransaction {
  id: number;
  user_id: number;
  order_id: string;
  plan: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "expired";
  payment_type: string | null;
  snap_token: string | null;
  paid_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface CreateTransactionResponse {
  va_number: string;
  bank: string;
  amount: number;
  order_id: string;
  expiry_time?: string;
}

export const membershipService = {
  getPlans: () =>
    api.get<ApiResponse<{ plans: MembershipPlan[] }>>("/membership/plans"),

  createTransaction: (plan: string, bank: string) =>
    api.post<ApiResponse<CreateTransactionResponse>>("/membership/transaction", {
      plan,
      bank,
    }),

  checkStatus: () =>
    api.get<ApiResponse<{ transaction: MembershipTransaction | null; is_member: boolean }>>(
      "/membership/status"
    ),

  // Admin APIs
  getAdminPlans: () =>
    api.get<ApiResponse<MembershipPlan[]>>("/membership-plans"),

  updateAdminPlan: (id: number, data: Partial<MembershipPlan>) =>
    api.put<ApiResponse<MembershipPlan>>(`/admin/membership-plans/${id}`, data),
};

