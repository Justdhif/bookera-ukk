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
  cover_image: string;

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

export interface CreateBookData {
  title: string;
  author_ids: number[];
  publisher_ids: number[];
  publication_year: string;
  isbn: string;
  language: string;
  description: string;
  is_active: boolean;
  category_ids: number[];
  cover_image?: File | null;
}

export interface UpdateBookData extends Partial<CreateBookData> {
  title: string;
}

export interface BookFilterParams {
  search?: string;
  category_ids?: number[];
  status?: "active" | "inactive";
  per_page?: number;
  page?: number;
}
