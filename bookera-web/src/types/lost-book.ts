import { Borrow } from "./borrow";
import { BookCopy } from "./book-copy";
import { Book } from "./book";

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
