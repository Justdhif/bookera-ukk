import { Book } from "./book";
import { PaginatedResponse } from "./api";

export interface BookFavorite {
  id: number;
  user_id: number;
  book_id: number;
  created_at: string;
  updated_at: string;
  book?: Book;
}

export interface FavoriteCheckResponse {
  is_favorite: boolean;
}

export type PaginatedFavoriteResponse = PaginatedResponse<BookFavorite>;
