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
  borrow_date: string;
  return_date: string;
  approval_status: 'processing' | 'canceled' | 'approved' | 'rejected';
  reject_reason?: string | null;

  user?: User;
  borrow_request_details: BorrowRequestDetail[];

  created_at: string;
  updated_at: string;
}
