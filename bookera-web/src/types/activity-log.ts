import { User } from "./user";

export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  module: string;
  description: string;
  subject_type: string | null;
  subject_id: number | null;
  old_data: any | null;
  new_data: any | null;
  ip_address: string;
  user_agent: string;
  created_at: string;
  updated_at: string;
  user?: User & {
    profile?: {
      full_name: string;
    };
  };
  subject?: any;
}

export interface ActivityLogIndexResponse {
  logs: {
    current_page: number;
    data: ActivityLog[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
  charts: {
    monthly: MonthlyChartData[];
    modules: string[];
    current_year: number;
    available_years: number[];
  };
  statistics: {
    today: number;
    this_week: number;
    this_month: number;
    total: number;
  };
}

export interface ChartData {
  name: string;
  value: number;
}

export interface MonthlyChartData {
  month: string;
  [module: string]: number | string;
}

export interface ActivityLogFilters {
  page?: number;
  per_page?: number;
  user_id?: number;
  action?: string;
  module?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  year?: number;
}
