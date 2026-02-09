import { Loan } from "./loan";
import { BookCopy } from "./book-copy";
import { Book } from "./book";

export interface LostBook {
  id: number;
  loan_id: number;
  book_copy_id: number;
  estimated_lost_date?: string;
  notes?: string;
  
  loan?: Loan & {
    user?: {
      profile?: {
        full_name: string;
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
