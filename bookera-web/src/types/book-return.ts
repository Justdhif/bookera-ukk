import { Borrow } from "./borrow";
import { BookCopy } from "./book-copy";
import { Book } from "./book";
import { Fine } from "./fine";

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
  borrow_id: number;
  return_date: string;
  
  borrow: Borrow & {
    fines?: Fine[];
  };
  details: BookReturnDetail[];
  
  created_at: string;
  updated_at: string;
}
