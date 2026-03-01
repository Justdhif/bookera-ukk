import { Book } from "./book";
import { User } from "./user";

export interface BorrowRequestDetail {
  id: number;
  borrow_request_id: number;
  book_id: number;
  book: Book;
}

export interface BorrowRequest {
  id: number;
  user_id: number;
  request_code: string;
  qr_code_url?: string;
  borrow_date: string;
  return_date: string;

  user?: User;
  borrow_request_details: BorrowRequestDetail[];

  created_at: string;
  updated_at: string;
}
