import { Book } from "./book";
import { PaginatedResponse } from "./api";

export interface Save {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  cover: string | null;
  covers: string[];
  total_books: number;
  created_at: string;
  updated_at: string;
  books?: Book[];
}

export interface SaveListItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  cover: string | null;
  covers: string[];
  total_books: number;
  created_at: string;
  updated_at: string;
}

export interface SaveFormData {
  name: string;
  description?: string;
}

export type PaginatedSaveResponse = PaginatedResponse<SaveListItem>;
