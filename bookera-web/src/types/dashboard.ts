export interface DashboardTotals {
  total_users: number;
  total_books: number;
  loans_today: number;
  returns_today: number;
}

export interface LoanMonthly {
  month: number;
  total: number;
}

export interface LoanStatus {
  status: string;
  total: number;
}

export interface LatestLoan {
  id: number;
  user_id: number;
  loan_date: string;
  due_date: string;
  status: string;
  user?: {
    id: number;
    email: string;
    profile?: {
      full_name: string;
    };
  };
  loan_details?: {
    book_copy?: {
      book?: {
        title: string;
      };
    };
  }[];
}
