import { Category } from "./category";
import { BookCopy } from "./book-copy";
import { Author } from "./author";
import { Publisher } from "./publisher";
import { PaginatedResponse } from "./api";

export interface Book {
  id: number;
  title: string;
  slug: string;
  author: string;
  publisher?: string;
  publication_year?: number;
  isbn?: string;
  description?: string;

  language?: string;
  cover_image?: string;
  cover_image_url?: string;

  is_active: boolean;

  categories: Category[];
  authors?: Author[];
  publishers?: Publisher[];
  copies: BookCopy[];

  total_copies?: number;
  available_copies?: number;

  created_at: string;
  updated_at: string;
}

export type BookListResponse = PaginatedResponse<Book>;
