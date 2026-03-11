import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { Publisher, PublisherListResponse } from "@/types/publisher";

export interface CreatePublisherData {
  name: string;
  description?: string;
  photo?: File | null;
  is_active?: boolean;
}

export interface UpdatePublisherData {
  name: string;
  description?: string;
  photo?: File | null;
  is_active?: boolean;
}

export interface PublisherFilterParams {
  search?: string;
  is_active?: boolean;
  per_page?: number;
  page?: number;
}

export const publisherService = {
  getAll: () => api.get<ApiResponse<Publisher[]>>("/publishers"),

  getAdminList: (filters?: PublisherFilterParams) =>
    api.get<ApiResponse<PublisherListResponse>>("/admin/publishers", {
      params: filters,
    }),

  show: (id: number) => api.get<ApiResponse<Publisher>>(`/publishers/${id}`),

  create: (data: CreatePublisherData) => {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    if (data.photo instanceof File) formData.append("photo", data.photo);
    if (data.is_active !== undefined) {
      formData.append("is_active", data.is_active ? "1" : "0");
    }
    return api.post<ApiResponse<Publisher>>("/admin/publishers", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (id: number, data: UpdatePublisherData) => {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.description !== undefined)
      formData.append("description", data.description);
    if (data.photo instanceof File) formData.append("photo", data.photo);
    if (data.is_active !== undefined) {
      formData.append("is_active", data.is_active ? "1" : "0");
    }
    return api.post<ApiResponse<Publisher>>(
      `/admin/publishers/${id}?_method=PUT`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },

  delete: (id: number) =>
    api.delete<ApiResponse<{ deleted_publisher_id: number }>>(
      `/admin/publishers/${id}`,
    ),
};
