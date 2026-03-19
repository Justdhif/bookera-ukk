import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  User,
  UserListResponse,
  CreateUserData,
  UpdateUserData,
  UserFilterParams,
  NotificationSettings,
} from "@/types/user";
import { buildUserFormData } from "./form-data/user.form-data";

export const userService = {
  getAll: (filters?: UserFilterParams) =>
    api.get<ApiResponse<UserListResponse>>("/admin/users", { params: filters }),

  getById: (id: number) => api.get<ApiResponse<User>>(`/admin/users/${id}`),

  getByIdentification: (identificationNumber: string) =>
    api.get<ApiResponse<User>>(
      `/admin/users/identification/${identificationNumber}`,
    ),

  create: (data: CreateUserData) =>
    api.post<ApiResponse<User>>("/admin/users", buildUserFormData(data), {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: number, data: UpdateUserData) =>
    api.post<ApiResponse<User>>(
      `/users/${id}?_method=PUT`,
      buildUserFormData(data),
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    ),

  delete: (id: number) => api.delete<ApiResponse<null>>(`/admin/users/${id}`),

  getNotificationSettings: () =>
    api.get<ApiResponse<NotificationSettings>>("/settings/notifications"),

  updateNotificationSettings: (data: NotificationSettings) =>
    api.patch<ApiResponse<NotificationSettings>>(
      "/settings/notifications",
      data,
    ),
};
