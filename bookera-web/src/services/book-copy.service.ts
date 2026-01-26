import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { BookCopy } from "@/types/book-copy";

export const bookCopyService = {
  create: (bookId: number, copy_code: string) =>
    api.post<ApiResponse<BookCopy>>(`/admin/books/${bookId}/copies`, { copy_code }),

  delete: (copyId: number) =>
    api.delete<ApiResponse<{ deleted_copy_id: number }>>(
      `/admin/book-copies/${copyId}`,
    ),
};
