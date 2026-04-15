import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  Author,
  AuthorListResponse,
  CreateAuthorData,
  UpdateAuthorData,
  AuthorFilterParams,
} from "@/types/author";
import { buildAuthorFormData } from "./form-data/author.form-data";

export const authorService = {
  getAll: (filters?: AuthorFilterParams) =>
    api.get<ApiResponse<AuthorListResponse>>("/admin/authors", {
      params: filters,
    }),

  getById: (id: number) =>
    api.get<ApiResponse<Author>>(`/admin/authors/${id}`),

  create: (data: CreateAuthorData) =>
    api.post<ApiResponse<Author>>("/admin/authors", buildAuthorFormData(data), {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: number, data: UpdateAuthorData) =>
    api.post<ApiResponse<Author>>(
      `/admin/authors/${id}?_method=PUT`,
      buildAuthorFormData(data),
      { headers: { "Content-Type": "multipart/form-data" } },
    ),

  delete: (id: number) =>
    api.delete<ApiResponse<{ deleted_author_id: number }>>(
      `/admin/authors/${id}`,
    ),
};
