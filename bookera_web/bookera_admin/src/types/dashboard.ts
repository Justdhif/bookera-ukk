export interface DashboardTotals {
  total_users: number;
  total_books: number;
  total_borrows: number;
  total_returns: number;
}

export interface TopBorrowedStat {
  id: number;
  name: string;
  slug: string;
  total_borrows: number;
}

export interface TopBorrowedCategory extends TopBorrowedStat {}

export interface TopBorrowedBook extends TopBorrowedStat {}

export interface BorrowMonthly {
  month: number;
  open_borrows: number;
  close_borrows: number;
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
