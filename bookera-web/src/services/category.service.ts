import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { Category } from "@/types/category";

export const categoryService = {
  getAll: () => api.get<ApiResponse<Category[]>>("/categories"),

  create: (payload: { name: string; description?: string }) =>
    api.post<ApiResponse<Category>>("/admin/categories", payload),

  update: (
    id: number,
    payload: {
      name: string;
      description?: string;
    },
  ) => api.put<ApiResponse<Category>>(`/admin/categories/${id}`, payload),

  delete: (id: number) =>
    api.delete<ApiResponse<{ deleted_category_id: number }>>(
      `/admin/categories/${id}`,
    ),
};
