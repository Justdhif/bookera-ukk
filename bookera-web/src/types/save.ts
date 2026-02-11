import { Book } from "./book";

export interface Save {
  id: number;
  name: string;
  description: string | null;
  covers: string[];
  total_books: number;
  created_at: string;
  updated_at: string;
  books?: Book[];
}

export interface SaveListItem {
  id: number;
  name: string;
  description: string | null;
  covers: string[];
  total_books: number;
  created_at: string;
  updated_at: string;
}

export interface SaveFormData {
  name: string;
  description?: string;
}

export interface PaginatedSaveResponse {
  current_page: number;
  data: SaveListItem[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}
