import { PaginatedResponse } from "./api";

export interface Author {
  id: number;
  slug: string;
  name: string;
  bio?: string;
  photo: string;
  photo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type AuthorListResponse = PaginatedResponse<Author>;
