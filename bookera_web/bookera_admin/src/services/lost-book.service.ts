import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { LostBookListResponse, LostBookFilterParams } from "@/types/lost-book";

export const lostBookService = {
  getAll: (filters?: LostBookFilterParams) =>
    api.get<ApiResponse<LostBookListResponse>>("/lost-books", {
      params: filters,
    }),

  exportData: (filters?: LostBookFilterParams) =>
    api.get("/lost-books/export", {
      params: filters,
      responseType: "blob",
    }),
};

