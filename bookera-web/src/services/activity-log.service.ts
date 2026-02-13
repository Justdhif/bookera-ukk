import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { ActivityLog, ActivityLogIndexResponse, ActivityLogFilters } from "@/types/activity-log";

export const activityLogService = {
  /**
   * ADMIN - Get all activity logs
   */
  getAll: (params?: ActivityLogFilters) =>
    api.get<ApiResponse<ActivityLogIndexResponse>>("/admin/activity-logs", { params }),

  /**
   * ADMIN - Get activity log detail
   */
  show: (id: number) =>
    api.get<ApiResponse<ActivityLog>>(`/admin/activity-logs/${id}`),
};
