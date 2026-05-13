import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  Category,
  CategoryFilterParams,
  CategoryListResponse,
} from "@/types/category";

export const categoryService = {
  getAll: (filters?: CategoryFilterParams) =>
    api.get<ApiResponse<CategoryListResponse>>("/admin/categories", {
      params: filters,
    }),

  create: (payload: { name: string; description?: string; icon?: string }) =>
    api.post<ApiResponse<Category>>("/admin/categories", payload),

  update: (
    id: number,
    payload: {
      name: string;
      description?: string;
      icon?: string;
    },
  ) => api.put<ApiResponse<Category>>(`/admin/categories/${id}`, payload),

  delete: (id: number) =>
    api.delete<ApiResponse<{ deleted_category_id: number }>>(
      `/admin/categories/${id}`,
    ),
};

