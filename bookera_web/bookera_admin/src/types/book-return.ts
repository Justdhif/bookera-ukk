import { Borrow } from "./borrow";
import { BookCopy } from "./book-copy";
import { Book } from "./book";
import { PaginatedResponse } from "./api";

export interface BookReturn {
  id: number;
  borrow_id: number;
  book_copy_id?: number | null;
  return_date: string;
  condition?: "good" | "damaged";

  borrow?: Borrow;
  book_copy?: BookCopy & {
    book?: Book;
  };

  created_at: string;
  updated_at: string;
}

export type ReturnListResponse = PaginatedResponse<Borrow>;

export interface ReturnFilterParams {
  search?: string;
  per_page?: number;
  page?: number;
  start_date?: string;
  end_date?: string;
}
