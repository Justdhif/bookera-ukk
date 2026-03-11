import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { Book, BookListResponse } from "@/types/book";

export interface CreateBookData {
  title: string;
  author_ids: number[];
  publisher_ids: number[];
  publication_year: string;
  isbn: string;
  language: string;
  description: string;
  is_active: boolean;
  category_ids: number[];
  cover_image?: File | null;
}

export interface UpdateBookData extends Partial<CreateBookData> {
  title: string;
}

const buildBookFormData = (data: CreateBookData | UpdateBookData): FormData => {
  const formData = new FormData();
  formData.append("title", (data.title ?? "").trim());
  formData.append("language", (data.language ?? "").trim());
  formData.append("description", (data.description ?? "").trim());
  formData.append("is_active", (data.is_active ?? true) ? "1" : "0");
  if (data.isbn) formData.append("isbn", data.isbn.trim());
  if (data.publication_year)
    formData.append("publication_year", data.publication_year);
  data.category_ids?.forEach((id) =>
    formData.append("category_ids[]", String(id)),
  );
  data.author_ids?.forEach((id) => formData.append("author_ids[]", String(id)));
  data.publisher_ids?.forEach((id) =>
    formData.append("publisher_ids[]", String(id)),
  );
  if (data.cover_image) formData.append("cover_image", data.cover_image);
  return formData;
};

export interface BookFilterParams {
  search?: string;
  category_ids?: number[];
  status?: "active" | "inactive";
  per_page?: number;
  page?: number;
}

export const bookService = {
  getAll: (filters?: BookFilterParams) => {
    const { category_ids, ...params } = filters ?? {};
    if (category_ids?.length)
      Object.assign(params, { category_ids: category_ids.join(",") });
    return api.get<ApiResponse<BookListResponse>>("/books", { params });
  },

  show: (id: number) => api.get<ApiResponse<Book>>(`/books/${id}`),

  showBySlug: (slug: string) =>
    api.get<ApiResponse<Book>>(`/books/slug/${slug}`),

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
};
