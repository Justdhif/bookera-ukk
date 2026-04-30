import { User } from "./user";

export interface DiscussionPost {
  id: number;
  user_id: number;
  caption: string;
  slug: string;
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
  taken_down_at: string | null;
  taken_down_reason: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
  images?: DiscussionPostImage[];
}

export interface DiscussionPostImage {
  id: number;
  post_id: number;
  image_path: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface DiscussionComment {
  id: number;
  post_id: number;
  user_id: number;
  parent_id: number | null;
  content: string;
  image?: string | null;
  replies_count?: number;
  created_at: string;
  updated_at: string;
  user?: User;
  replies?: DiscussionComment[];
}

export interface CreateDiscussionData {
  caption: string;
  images?: File[];
}

export interface UpdateDiscussionData {
  caption: string;
  images?: (File | string)[];
}
