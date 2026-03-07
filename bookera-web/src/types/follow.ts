import { Book } from "./book";

export type FollowableType = "author" | "publisher";

export interface FollowedAuthor {
  id: number;
  slug: string;
  name: string;
  bio?: string;
  photo: string;
  photo_url?: string;
  is_active: boolean;
  books_count: number;
  follow_id: number;
  created_at: string;
  updated_at: string;
}

export interface FollowedPublisher {
  id: number;
  slug: string;
  name: string;
  description?: string;
  photo: string;
  photo_url?: string;
  is_active: boolean;
  books_count: number;
  follow_id: number;
  created_at: string;
  updated_at: string;
}

export interface AuthorDetail {
  id: number;
  slug: string;
  name: string;
  bio?: string;
  photo: string;
  photo_url?: string;
  is_active: boolean;
  books_count: number;
  is_following: boolean;
  books: Book[];
  created_at: string;
  updated_at: string;
}

export interface PublisherDetail {
  id: number;
  slug: string;
  name: string;
  description?: string;
  photo: string;
  photo_url?: string;
  is_active: boolean;
  books_count: number;
  is_following: boolean;
  books: Book[];
  created_at: string;
  updated_at: string;
}
