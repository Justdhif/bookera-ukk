export interface DashboardTotals {
  total_users: number;
  total_books: number;
  total_categories: number;
  total_authors: number;
  total_publishers: number;
  total_fines: number;
  loans_today: number;
  returns_today: number;
}

export interface BorrowMonthly {
  month: number;
  open_borrows: number;
  close_borrows: number;
}

export interface LoginRegisterTrend {
  month: number;
  login_count: number;
  register_count: number;
}

export interface BorrowStatus {
  status: string;
  total: number;
}

export interface CalendarDay {
  date: number;
  open_borrows: number;
  close_borrows: number;
}

export interface DayDetailBorrow {
  id: number;
  borrow_code: string;
  status: string;
  user: {
    id: number;
    email: string;
    full_name: string;
    avatar: string | null;
  };
}

export interface DayDetail {
  date: string;
  open_borrows: number;
  close_borrows: number;
  total: number;
  borrows: DayDetailBorrow[];
}

export interface BorrowComparison {
  month: number;
  total_borrows: number;
  total_requests: number;
}

export interface LatestBorrow {
  id: number;
  user?: {
    email?: string;
    profile?: {
      full_name?: string;
    };
  };
  borrow_date?: string;
  status: string;
  borrow_details?: Array<{
    book_copy?: {
      book?: {
        title?: string;
      };
    };
  }>;
}
