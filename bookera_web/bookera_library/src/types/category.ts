import { PaginatedResponse } from "./api";

export interface Category {
  id: number;
  slug: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryFilterParams {
  search?: string;
  per_page?: number;
  page?: number;
}

export type CategoryListResponse = PaginatedResponse<Category>;
