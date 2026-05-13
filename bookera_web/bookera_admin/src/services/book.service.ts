import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  Book,
  BookListResponse,
  CreateBookData,
  UpdateBookData,
  BookFilterParams,
} from "@/types/book";
import { buildBookFormData } from "./form-data/book.form-data";

export const bookService = {
  getAll: (filters?: BookFilterParams) => {
    const { category_ids, genre_ids, ...params } = filters ?? {};
    if (category_ids?.length)
      Object.assign(params, { category_ids: category_ids.join(",") });
    if (genre_ids?.length)
      Object.assign(params, { genre_ids: genre_ids.join(",") });
    return api.get<ApiResponse<BookListResponse>>("/admin/books", { params });
  },

  getById: (id: number) => api.get<ApiResponse<Book>>(`/admin/books/${id}`),

  getBySlug: (slug: string) => api.get<ApiResponse<Book>>(`/admin/books/slug/${slug}`),

  create: (data: CreateBookData) =>
    api.post<ApiResponse<Book>>("/admin/books", buildBookFormData(data), {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: number, data: UpdateBookData) =>
    api.post<ApiResponse<Book>>(
      `/admin/books/${id}?_method=PUT`,
      buildBookFormData(data),
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    ),

  delete: (id: number) => api.delete<ApiResponse<null>>(`/admin/books/${id}`),

  import: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<ApiResponse<null>>("/admin/books/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  export: (filters?: BookFilterParams) => {
    const { category_ids, genre_ids, ...params } = filters ?? {};
    if (category_ids?.length)
      Object.assign(params, { category_ids: category_ids.join(",") });
    if (genre_ids?.length)
      Object.assign(params, { genre_ids: genre_ids.join(",") });
    return api.get("/admin/books/export", {
      params,
      responseType: "blob",
    });
  },
};


