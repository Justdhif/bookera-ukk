import { User } from "./user";

export interface DiscussionPost {
  id: number;
  user_id: number;
  caption: string;
  slug: string;
  likes_count: number;
  comments_count: number;
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
