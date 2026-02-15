import { User } from "./user";
import { BookCopy } from "./book-copy";
import { Book } from "./book";
import { BookReturn } from "./book-return";
import { Fine } from "./fine";
import { LostBook } from "./lost-book";

export interface LoanDetail {
  id: number;
  book_copy_id: number;
  approval_status: "pending" | "approved" | "rejected";
  note?: string;
  book_copy: BookCopy & {
    book: Book;
  };
}

export interface Loan {
  id: number;
  user_id: number;
  loan_date: string;
  due_date: string;
  return_date?: string;
  status: "pending" | "waiting" | "borrowed" | "checking" | "returned" | "rejected" | "late" | "lost";
  approval_status: "pending" | "processing" | "approved" | "rejected" | "partial";

  user?: User;
  loan_details: LoanDetail[];
  book_returns?: BookReturn[];
  fines?: Fine[];
  lost_books?: LostBook[];

  created_at: string;
  updated_at: string;
}
