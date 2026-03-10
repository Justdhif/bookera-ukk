import { Book } from "./book";
import { User } from "./user";

export type FollowableType = "author" | "publisher" | "user";

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

export interface FollowedUser {
  id: number;
  email: string;
  follow_id: number;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name?: string;
    avatar?: string;
  };
}

/** A record from the `follows` table returned by user-followers endpoints */
export interface UserFollowRecord {
  id: number;
  user_id: number;
  followable_id: number;
  followable_type: string;
  created_at: string;
  updated_at: string;
  /** Present in getUserFollowers — the user who is following */
  user?: User;
  /** Present in getUserFollowing — the user being followed */
  followable?: User;
}

export interface FollowableDetail {
  id: number;
  slug: string;
  name: string;
  bio?: string;
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
