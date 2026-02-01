import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { ActivityLog, ActivityLogIndexResponse, ActivityLogFilters } from "@/types/activity-log";

export const activityLogService = {
  getAll: (params?: ActivityLogFilters) =>
    api.get<ApiResponse<ActivityLogIndexResponse>>("/activity-logs", { params }),

  show: (id: number) =>
    api.get<ApiResponse<ActivityLog>>(`/activity-logs/${id}`),
};
