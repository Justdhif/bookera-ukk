import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { Borrow } from "@/types/borrow";

export const borrowService = {

  getAll: (search?: string) =>
    api.get<ApiResponse<Borrow[]>>("/admin/borrows", { params: { search } }),

  create: (data: { book_copy_ids: number[]; return_date: string }) =>
    api.post<ApiResponse<Borrow>>("/borrows", data),

  createAdminBorrow: (data: { user_id: number; book_copy_ids: number[]; borrow_date: string; return_date: string }) =>
    api.post<ApiResponse<Borrow>>("/admin/borrows", data),

  show: (id: number) => api.get<ApiResponse<Borrow>>(`/borrows/${id}`),

  showByCode: (code: string) => api.get<ApiResponse<Borrow>>(`/borrows/code/${code}`),

  showAdminByCode: (code: string) => api.get<ApiResponse<Borrow>>(`/admin/borrows/code/${code}`),

  getMyBorrows: () => api.get<ApiResponse<Borrow[]>>("/my-borrows"),
};
