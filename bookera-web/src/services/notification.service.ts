import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { Notification, NotificationListResponse } from "@/types/notification";

export interface NotificationFilterParams {
  per_page?: number;
  page?: number;
  filter?: "read" | "unread";
  module?: string;
}

export const notificationService = {
  getNotifications: (params?: NotificationFilterParams) =>
    api.get<ApiResponse<NotificationListResponse>>("/notifications", { params }),

  getNotification: (id: number) =>
    api.get<ApiResponse<Notification>>(`/notifications/${id}`),

  getUnreadCount: () =>
    api.get<ApiResponse<{ unread_count: number }>>("/notifications/unread-count"),

  markAsRead: (id: number) =>
    api.post<ApiResponse<Notification>>(`/notifications/${id}/mark-read`),

  markAllAsRead: () =>
    api.post<ApiResponse<{ updated_count: number }>>("/notifications/mark-all-read"),

  deleteNotification: (id: number) =>
    api.delete<ApiResponse<null>>(`/notifications/${id}`),

  deleteAllRead: () =>
    api.delete<ApiResponse<{ deleted_count: number }>>("/notifications/delete-all-read"),
};
