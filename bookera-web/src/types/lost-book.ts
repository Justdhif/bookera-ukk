import { Borrow } from "./borrow";
import { BookCopy } from "./book-copy";
import { Book } from "./book";
import { PaginatedResponse } from "./api";

export interface LostBook {
  id: number;
  borrow_id: number;
  book_copy_id: number;
  estimated_lost_date?: string;
  notes?: string;

  borrow?: Borrow & {
    user?: {
      profile?: {
        full_name: string;
        avatar: string;
      };
      email: string;
    };
  };

  book_copy?: BookCopy & {
    book: Book;
  };

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
