import { PaginatedResponse } from "./api";

export interface Genre {
  id: number;
  slug: string;
  name: string;
  icon?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface GenreFilterParams {
  search?: string;
  per_page?: number;
  page?: number;
}

export type GenreListResponse = PaginatedResponse<Genre>;
