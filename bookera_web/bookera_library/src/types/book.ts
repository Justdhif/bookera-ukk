import { Category } from "./category";
import { Genre } from "./genre";
import { BookCopy } from "./book-copy";
import { Author } from "./author";
import { Publisher } from "./publisher";
import { PaginatedResponse } from "./api";
import { BookReview } from "./review";
import { Reservation } from "./reservation";

export interface Book {
  id: number;
  title: string;
  slug: string;
  author: string;
  publisher?: string;
  publication_year?: number;
  isbn?: string;
  description?: string;
  price?: number;

  language?: string;
  cover_image: string;

  is_active: boolean;
  average_rating?: number;
  reviews_count?: number;
  favorites_count?: number;

  categories: Category[];
  authors?: Author[];
  publishers?: Publisher[];
  copies: BookCopy[];
  reviews?: BookReview[];
  genres?: Genre[];

  total_copies?: number;
  available_copies?: number;

  // Reservation-aware fields (injected by API for authenticated users)
  user_reservation?: Reservation | null;
  user_has_available_copy?: boolean;

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
  price?: number | string;
  is_active: boolean;
  category_ids: number[];
  genre_ids: number[];
  cover_image?: File | null;
}

export interface UpdateBookData extends Partial<CreateBookData> {
  title: string;
}

export interface BookFilterParams {
  search?: string;
  category_ids?: number[];
  genre_ids?: number[];
  status?: "active" | "inactive";
  author_ids?: number[];
  publisher_ids?: number[];
  per_page?: number;
  page?: number;
  rating?: number;
  min_reviews?: number;
}
