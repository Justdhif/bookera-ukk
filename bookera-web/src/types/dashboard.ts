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

export interface DashboardLatest {
  users: any[];
  books: any[];
  loans: any[];
}
