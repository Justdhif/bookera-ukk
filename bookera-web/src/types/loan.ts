import { User } from "./user";
import { BookCopy } from "./book-copy";
import { Book } from "./book";

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
  status: "borrowed" | "returned" | "overdue";

  user?: User;
  loan_details: LoanDetail[];

  created_at: string;
  updated_at: string;
}
