import { User } from "./user";

export interface News {
  id: number;
  admin_id: number;
  title: string;
  slug: string;
  content: string;
  image: string | null;
  created_at: string;
  updated_at: string;
  admin?: User;
  comments_count?: number;
}

export interface NewsComment {
  id: number;
  news_id: number;
  user_id: number;
  parent_id: number | null;
  content: string | null;
  image: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
  replies?: NewsComment[];
}
