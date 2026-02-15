import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { Loan } from "@/types/loan";

export const loanService = {
  /**
   * ADMIN / STAFF
   * get all loans
   */
  getAll: (search?: string) => 
    api.get<ApiResponse<Loan[]>>("/admin/loans", { params: { search } }),

  /**
   * CREATE LOAN (BORROW)
   */
  create: (data: { book_copy_ids: number[]; due_date: string }) =>
    api.post<ApiResponse<Loan>>("/loans", data),

  /**
   * CREATE LOAN AS ADMIN (direct borrow at library)
   */
  createAdminLoan: (data: { user_id: number; book_copy_ids: number[]; due_date: string }) =>
    api.post<ApiResponse<Loan>>("/admin/loans", data),

  /**
   * DETAIL LOAN
   */
  show: (id: number) => api.get<ApiResponse<Loan>>(`/loans/${id}`),

  /**
   * USER - MY LOANS
   */
  getMyLoans: () => api.get<ApiResponse<Loan[]>>("/my-loans"),

  /**
   * ADMIN - APPROVAL ENDPOINTS
   */
  getPendingLoans: (search?: string) => 
    api.get<ApiResponse<Loan[]>>("/admin/approvals/loans/pending", { params: { search } }),
  
  getApprovedLoans: (search?: string) => 
    api.get<ApiResponse<Loan[]>>("/admin/approvals/loans/approved", { params: { search } }),

  approveLoan: (id: number) => 
    api.post<ApiResponse<Loan>>(`/admin/approvals/loans/${id}/approve`),

  rejectLoan: (id: number, data?: { rejection_reason?: string }) => 
    api.post<ApiResponse<Loan>>(`/admin/approvals/loans/${id}/reject`, data),

  markAsBorrowed: (id: number) => 
    api.post<ApiResponse<Loan>>(`/admin/approvals/loans/${id}/mark-borrowed`),

  approveLoanDetail: (detailId: number) => 
    api.post<ApiResponse<any>>(`/admin/approvals/loan-details/${detailId}/approve`),

  rejectLoanDetail: (detailId: number, data?: { note?: string }) => 
    api.post<ApiResponse<any>>(`/admin/approvals/loan-details/${detailId}/reject`, data),
};
