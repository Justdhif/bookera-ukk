import { Loan } from "./loan";
import { BookCopy } from "./book-copy";
import { Book } from "./book";

export interface BookReturnDetail {
  id: number;
  book_return_id: number;
  book_copy_id: number;
  condition: "good" | "damaged" | "lost";
  book_copy: BookCopy & {
    book: Book;
  };
  created_at: string;
  updated_at: string;
}

export interface BookReturn {
  id: number;
  loan_id: number;
  return_date: string;
  approval_status: "pending" | "approved" | "rejected";
  
  loan: Loan;
  details: BookReturnDetail[];
  
  created_at: string;
  updated_at: string;
}
