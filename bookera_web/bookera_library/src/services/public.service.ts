import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  Book,
  BookListResponse,
  BookFilterParams,
} from "@/types/book";
import {
  Author,
  AuthorFilterParams,
  AuthorListResponse,
} from "@/types/author";
import {
  Publisher,
  PublisherFilterParams,
  PublisherListResponse,
} from "@/types/publisher";
import {
  CategoryFilterParams,
  CategoryListResponse,
} from "@/types/category";

export const publicService = {
  getBooks: (filters?: BookFilterParams) => {
    const { category_ids, genre_ids, ...params } = filters ?? {};
    if (category_ids?.length) {
      Object.assign(params, { category_ids: category_ids.join(",") });
    }
    if (genre_ids?.length) {
      Object.assign(params, { genre_ids: genre_ids.join(",") });
    }

    return api.get<ApiResponse<BookListResponse>>("/books", { params });
  },

  getBookBySlug: (slug: string) =>
    api.get<ApiResponse<Book>>(`/books/slug/${slug}`),

  getBookById: (id: number) =>
    api.get<ApiResponse<Book>>(`/books/${id}`),

  getAuthors: (filters?: AuthorFilterParams) =>
    api.get<ApiResponse<AuthorListResponse>>("/authors", {
      params: { ...filters, is_active: true },
    }),

  getAuthorBySlug: (slug: string) =>
    api.get<ApiResponse<Author>>(`/authors/slug/${slug}`),

  getPublishers: (filters?: PublisherFilterParams) =>
    api.get<ApiResponse<PublisherListResponse>>("/publishers", {
      params: { ...filters, is_active: true },
    }),

  getPublisherBySlug: (slug: string) =>
    api.get<ApiResponse<Publisher>>(`/publishers/slug/${slug}`),

  getCategories: (filters?: CategoryFilterParams) =>
    api.get<ApiResponse<CategoryListResponse>>("/categories", {
      params: filters,
    }),
  getTopDiscussions: () =>
    api.get<ApiResponse<import("@/types/discussion").DiscussionPost[]>>("/discussions/top"),

  getDiscussions: (params?: { page?: number; per_page?: number; search?: string }) =>
    api.get<ApiResponse<import("@/types/api").PaginatedResponse<import("@/types/discussion").DiscussionPost>>>("/discussions", { params }),

  getUsers: (params?: import("@/types/user").UserFilterParams) =>
    api.get<ApiResponse<import("@/types/user").UserListResponse>>("/users", { params }),

  getStats: () =>
    api.get<ApiResponse<{
      total_books: number;
      total_users: number;
      top_rated_books: Array<{
        id: number;
        title: string;
        slug: string;
        cover_image: string;
        author: string;
        average_rating: number;
        reviews_count: number;
        favorites_count: number;
        categories: string[];
      }>;
      recent_discussions: Array<{
        id: number;
        slug: string;
        caption: string;
        likes_count: number;
        comments_count: number;
        created_at: string;
        user_name: string;
        user_avatar: string | null;
      }>;
      recent_complaints: Array<{
        id: number;
        slug: string;
        title: string;
        category: string;
        status: string;
        created_at: string;
      }>;
    }>>("/stats"),
};

export default publicService;
