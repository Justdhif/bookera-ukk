import { User } from "./user";
import { BookCopy } from "./book-copy";
import { Book } from "./book";
import { BookReturn } from "./book-return";
import { Fine } from "./fine";

export interface LoanDetail {
  id: number;
  book_copy_id: number;
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
  status: "pending" | "waiting" | "borrowed" | "checking" | "returned" | "rejected" | "late";
  approval_status: "pending" | "approved" | "rejected";

  user?: User;
  loan_details: LoanDetail[];
  book_returns?: BookReturn[];
  fines?: Fine[];

  created_at: string;
  updated_at: string;
}
