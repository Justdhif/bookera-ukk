import { PaginatedResponse } from "./api";

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string | null;
  type: string | null;
  module: string | null;
  data: Record<string, any> | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export type NotificationListResponse = PaginatedResponse<Notification>;
