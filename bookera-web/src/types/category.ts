import { PaginatedResponse } from "./api";

export interface Category {
  id: number;
  slug: string;
  name: string;
  icon?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export type CategoryListResponse = PaginatedResponse<Category>;
