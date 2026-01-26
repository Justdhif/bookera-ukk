import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { Book } from "@/types/book";

export const bookService = {
  getAll: (params?: any) => api.get<ApiResponse<any>>("/books", { params }),

  show: (id: number) => api.get<ApiResponse<Book>>(`/books/${id}`),

  create: (data: FormData) =>
    api.post<ApiResponse<Book>>("/admin/books", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  update: (id: number, data: FormData) =>
    api.post<ApiResponse<Book>>(`/admin/books/${id}?_method=PUT`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  delete: (id: number) => api.delete<ApiResponse<null>>(`/admin/books/${id}`),
};
