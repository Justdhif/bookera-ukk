import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  Publisher,
  PublisherListResponse,
  CreatePublisherData,
  UpdatePublisherData,
  PublisherFilterParams,
} from "@/types/publisher";
import { buildPublisherFormData } from "./form-data/publisher.form-data";

export const publisherService = {
  getAll: (filters?: PublisherFilterParams | any, isAdmin = false) =>
    api.get<ApiResponse<any>>(isAdmin ? "/admin/publishers" : "/publishers", {
      params: filters,
    }),

  getById: (id: number) => api.get<ApiResponse<Publisher>>(`/publishers/${id}`),

  create: (data: CreatePublisherData) =>
    api.post<ApiResponse<Publisher>>(
      "/admin/publishers",
      buildPublisherFormData(data),
      { headers: { "Content-Type": "multipart/form-data" } },
    ),

  update: (id: number, data: UpdatePublisherData) =>
    api.post<ApiResponse<Publisher>>(
      `/admin/publishers/${id}?_method=PUT`,
      buildPublisherFormData(data),
      { headers: { "Content-Type": "multipart/form-data" } },
    ),

  delete: (id: number) =>
    api.delete<ApiResponse<{ deleted_publisher_id: number }>>(
      `/admin/publishers/${id}`,
    ),
};
