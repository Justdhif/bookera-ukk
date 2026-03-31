import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { Notification, NotificationListResponse } from "@/types/notification";

export interface NotificationFilterParams {
  per_page?: number;
  page?: number;
  filter?: "read" | "unread";
  module?: string;
}

export interface NotificationModuleParams {
  module?: string;
}

export const notificationService = {
  getAll: (params?: NotificationFilterParams) =>
    api.get<ApiResponse<NotificationListResponse>>("/notifications", { params }),

  getById: (id: number) =>
    api.get<ApiResponse<Notification>>(`/notifications/${id}`),

  getUnreadCount: (params?: NotificationModuleParams) =>
    api.get<ApiResponse<{ unread_count: number }>>("/notifications/unread-count", {
      params,
    }),

  markAsRead: (id: number) =>
    api.post<ApiResponse<Notification>>(`/notifications/${id}/mark-read`),

  markAllAsRead: (params?: NotificationModuleParams) =>
    api.post<ApiResponse<{ updated_count: number }>>(
      "/notifications/mark-all-read",
      undefined,
      { params },
    ),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/notifications/${id}`),

  deleteAllRead: (params?: NotificationModuleParams) =>
    api.delete<ApiResponse<{ deleted_count: number }>>(
      "/notifications/delete-all-read",
      { params },
    ),
};
