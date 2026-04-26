import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  Notification,
  NotificationFilterParams,
  NotificationListResponse,
} from "@/types/notification";

export const notificationService = {
  getAll: (params?: NotificationFilterParams) =>
    api.get<ApiResponse<NotificationListResponse>>("/notifications", {
      params,
    }),

  getById: (id: number) =>
    api.get<ApiResponse<Notification>>(`/notifications/${id}`),

  getUnreadCount: () =>
    api.get<ApiResponse<{ unread_count: number }>>(
      "/notifications/unread-count",
    ),

  markAsRead: (id: number) =>
    api.post<ApiResponse<Notification>>(`/notifications/${id}/mark-read`),

  markAllAsRead: () =>
    api.post<ApiResponse<{ updated_count: number }>>(
      "/notifications/mark-all-read",
    ),

  delete: (id: number) => api.delete<ApiResponse<null>>(`/notifications/${id}`),

  deleteAllRead: () =>
    api.delete<ApiResponse<{ deleted_count: number }>>(
      "/notifications/delete-all-read",
    ),
};
