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

export interface NotificationListResponse {
  current_page: number;
  data: Notification[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}
