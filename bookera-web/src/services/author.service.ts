import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { Author } from "@/types/author";

export interface CreateAuthorData {
  name: string;
  bio?: string;
  photo: File;
  is_active?: boolean;
}

export interface UpdateAuthorData {
  name: string;
  bio?: string;
  photo?: File;
  is_active?: boolean;
}

export interface AuthorFilterParams {
  search?: string;
  is_active?: boolean;
  per_page?: number;
  page?: number;
}

export const authorService = {
  getAll: () =>
    api.get<ApiResponse<Author[]>>("/authors"),

  getAdminList: (filters?: AuthorFilterParams) =>
    api.get<ApiResponse<any>>("/admin/authors", { params: filters }),

  show: (id: number) =>
    api.get<ApiResponse<Author>>(`/authors/${id}`),

  create: (data: CreateAuthorData) => {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.bio) formData.append("bio", data.bio);
    formData.append("photo", data.photo);
    if (data.is_active !== undefined) {
      formData.append("is_active", data.is_active ? "1" : "0");
    }
    return api.post<ApiResponse<Author>>("/admin/authors", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (id: number, data: UpdateAuthorData) => {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.bio !== undefined) formData.append("bio", data.bio);
    if (data.photo instanceof File) formData.append("photo", data.photo);
    if (data.is_active !== undefined) {
      formData.append("is_active", data.is_active ? "1" : "0");
    }
    return api.post<ApiResponse<Author>>(
      `/admin/authors/${id}?_method=PUT`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },

  delete: (id: number) =>
    api.delete<ApiResponse<{ deleted_author_id: number }>>(
      `/admin/authors/${id}`,
    ),
};
