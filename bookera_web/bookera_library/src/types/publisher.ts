import { PaginatedResponse } from "./api";

export interface Publisher {
  id: number;
  slug: string;
  name: string;
  description?: string;
  photo: string;
  is_active: boolean;
  books_count?: number;
  created_at: string;
  updated_at: string;
}

export type PublisherListResponse = PaginatedResponse<Publisher>;

export interface CreatePublisherData {
  name: string;
  description?: string;
  photo?: File | null;
  is_active?: boolean;
}

export interface UpdatePublisherData {
  name: string;
  description?: string;
  photo?: File | null;
  is_active?: boolean;
}

export interface PublisherFilterParams {
  search?: string;
  is_active?: boolean;
  per_page?: number;
  page?: number;
}
