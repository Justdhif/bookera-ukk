import { User } from "./user";
import { BookCopy } from "./book-copy";
import { Book } from "./book";
import { BookReturn } from "./book-return";
import { Fine } from "./fine";
import { LostBook } from "./lost-book";
import { BorrowRequest } from "./borrow-request";
import { PaginatedResponse } from "./api";

export interface BorrowDetail {
  id: number;
  borrow_id: number;
  book_copy_id: number;
  status: "borrowed" | "returned" | "lost";
  note?: string;
  book_copy: BookCopy & {
    book: Book;
  };
}

export interface Borrow {
  id: number;
  user_id: number;
  borrow_request_id?: number | null;
  borrow_code: string;
  qr_code_url?: string;
  borrow_date: string;
  return_date: string;
  status: "open" | "close";

  user?: User;
  borrow_details: BorrowDetail[];
  borrow_request?: BorrowRequest | null;
  book_returns?: BookReturn[];
  fines?: Fine[];
  lost_books?: LostBook[];

  created_at: string;
  updated_at: string;
}

export type BorrowListResponse = PaginatedResponse<Borrow>;
