import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { ActivityLog, ActivityLogIndexResponse, ActivityLogFilters } from "@/types/activity-log";

export const activityLogService = {
  getAll: (params?: ActivityLogFilters, isAdmin = false) =>
    api.get<ApiResponse<ActivityLogIndexResponse>>(isAdmin ? "/admin/activity-logs" : "/activity-logs", { params }),

  getById: (id: number) =>
    api.get<ApiResponse<ActivityLog>>(`/admin/activity-logs/${id}`),
};
