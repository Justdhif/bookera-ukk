import { PaginatedResponse } from "./api";

export interface Author {
  id: number;
  slug: string;
  name: string;
  bio?: string;
  photo: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type AuthorListResponse = PaginatedResponse<Author>;

export interface CreateAuthorData {
  name: string;
  bio?: string;
  photo?: File | null;
  is_active?: boolean;
}

export interface UpdateAuthorData {
  name: string;
  bio?: string;
  photo?: File | null;
  is_active?: boolean;
}

export interface AuthorFilterParams {
  search?: string;
  is_active?: boolean;
  per_page?: number;
  page?: number;
}
