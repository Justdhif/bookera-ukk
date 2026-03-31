export interface DashboardTotals {
  total_users: number;
  total_books: number;
  loans_today: number;
  returns_today: number;
}

export interface BorrowMonthly {
  month: number;
  total: number;
}

export interface BorrowStatus {
  status: string;
  total: number;
}

export interface LatestBorrow {
  id: number;
  user_id: number;
  borrow_code: string;
  borrow_date: string;
  return_date: string;
  status: string;
  user?: {
    id: number;
    email: string;
    profile?: {
      full_name: string;
    };
  };
  borrow_details?: {
    book_copy?: {
      book?: {
        title: string;
      };
    };
  }[];
}
