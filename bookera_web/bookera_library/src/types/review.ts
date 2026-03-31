import { PaginatedResponse } from "./api";
import { UserProfile } from "./user";

export interface BookReviewUser {
  id: number;
  profile?: UserProfile;
}

export interface BookReview {
  id: number;
  user_id: number;
  book_id: number;
  rating: number;
  review: string | null;
  created_at: string;
  updated_at: string;
  user?: BookReviewUser;
}

export interface ReviewCheckResponse {
  review: BookReview | null;
}

export type PaginatedReviewResponse = PaginatedResponse<BookReview>;

export interface CreateReviewData {
  book_id: number;
  rating: number;
  review?: string;
}
