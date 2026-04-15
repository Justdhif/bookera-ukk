import { Borrow } from "./borrow";
import { BookCopy } from "./book-copy";
import { PaginatedResponse } from "./api";

export interface LostBookDetail {
  id: number;
  lost_book_id: number;
  book_copy_id: number;
  lost_date?: string;
  notes?: string;

  book_copy?: BookCopy;

  created_at: string;
  updated_at: string;
}

export interface LostBook {
  id: number;
  borrow_id: number;
  book_copy_id?: number;
  lost_date?: string;
  estimated_lost_date?: string;
  notes?: string;

  borrow?: Borrow;
  book_copy?: BookCopy;
  details?: LostBookDetail[];

  created_at: string;
  updated_at: string;
}

export type LostBookListResponse = PaginatedResponse<LostBook>;

export interface LostBookFilterParams {
  search?: string;
  borrow_status?: string;
  per_page?: number;
  page?: number;
}
