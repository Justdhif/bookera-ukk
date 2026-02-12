import { Category } from "./category";
import { BookCopy } from "./book-copy";

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
  copies: BookCopy[];

  total_copies?: number;
  available_copies?: number;

  created_at: string;
  updated_at: string;
}
