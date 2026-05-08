import { PaginatedResponse } from "./api";
import type { OccupationValue } from "@/constants/user-occupation";

export type UserOccupation = OccupationValue;

export interface UserProfile {
  id: number;
  user_id: number;
  full_name: string;
  username: string | null;
  gender: "male" | "female" | "prefer_not_to_say" | "croissant" | null;
  birth_date: string | null;
  avatar: string;
  phone_number: string | null;
  address: string | null;
  bio: string | null;
  identification_number: string | null;
  occupation: UserOccupation | null;
  institution: string | null;
  notification_enabled: boolean;
  notification_email: boolean;
  notification_whatsapp: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  slug?: string;
  role: "admin" | "officer:catalog" | "officer:management" | "user" | "member";
  is_active: boolean;
  last_login_at: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  is_following?: boolean;
  has_pending_borrow_request?: boolean;
  unpaid_fines_count?: number;
  followers_count?: number;
  following_count?: number;

  complaints_count?: number;
  active_membership?: Membership | null;

  profile: UserProfile | null;
}

export interface Membership {
  id: number;
  user_id: number;
  membership_plan_id: number;
  member_code: string;
  qr_code: string | null;
  qr_code_path: string | null;
  qr_code_url: string | null;
  joined_at: string;
  expires_at: string | null;
  status: "active" | "expired" | "cancelled";
  plan?: {
    id: number;
    name: string;
    damaged_fine_discount: number;
    lost_fine_discount: number;
  };
}

export type UserListResponse = PaginatedResponse<User>;

export type UserRole = User["role"];

export interface NotificationSettings {
  notification_enabled: boolean;
  notification_email: boolean;
  notification_whatsapp: boolean;
}

export interface CreateUserData {
  email: string;
  password: string;
  role: UserRole;
  is_active?: boolean;
  full_name: string;
  username?: string;
  gender?: "male" | "female" | "prefer_not_to_say" | "croissant";
  birth_date?: string;
  phone_number?: string;
  address?: string;
  bio?: string;
  identification_number?: string;
  occupation?: UserOccupation;
  institution?: string;
  avatar?: File | string;
}

export interface UpdateUserData extends Partial<CreateUserData> {
  email: string;
  role: UserRole;
  full_name: string;
}

export interface UserFilterParams {
  search?: string;
  role?: string;
  status?: string;
  per_page?: number;
  page?: number;
}
