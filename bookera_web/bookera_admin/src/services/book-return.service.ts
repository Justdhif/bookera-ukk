import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { ReturnFilterParams, ReturnListResponse } from "@/types/book-return";

export const bookReturnService = {
  getAll: (filters?: ReturnFilterParams) =>
    api.get<ApiResponse<ReturnListResponse>>("/returns", {
      params: filters,
    }),

  exportData: (filters?: ReturnFilterParams) =>
    api.get("/returns/export", {
      params: filters,
      responseType: "blob",
    }),

};

