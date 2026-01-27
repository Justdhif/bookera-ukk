import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { Loan } from "@/types/loan";

export const loanService = {
  /**
   * ADMIN / STAFF
   * get all loans
   */
  getAll: () => api.get<ApiResponse<Loan[]>>("/admin/loans"),

  /**
   * CREATE LOAN (BORROW)
   */
  create: (data: { book_copy_ids: number[]; due_date: string }) =>
    api.post<ApiResponse<Loan>>("/loans", data),

  /**
   * DETAIL LOAN
   */
  show: (id: number) => api.get<ApiResponse<Loan>>(`/loans/${id}`),

  /**
   * USER - MY LOANS
   */
  myLoans: () => api.get<ApiResponse<Loan[]>>("/loans/user"),
};
