import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { User } from "@/types/user";

export const userService = {
  /**
   * Get all users (for admin)
   */
  getAll: (search?: string) =>
    api.get<ApiResponse<User[]>>("/admin/users", { params: { search } }),

  /**
   * Get user by ID
   */
  show: (id: number) => api.get<ApiResponse<User>>(`/admin/users/${id}`),
};
