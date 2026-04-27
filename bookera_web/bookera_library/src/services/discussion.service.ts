import api from "@/lib/axios";
import { ApiResponse, PaginatedResponse } from "@/types/api";
import { DiscussionPost } from "@/types/discussion";

export const discussionService = {
  getAll: (params?: { page?: number; per_page?: number }) =>
    api.get<ApiResponse<PaginatedResponse<DiscussionPost>>>("/discussion-posts", { params }),

  getByUser: (userSlug: string, params?: { page?: number; per_page?: number }) =>
    api.get<ApiResponse<PaginatedResponse<DiscussionPost>>>(`/discussion-posts/user/${userSlug}`, { params }),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<DiscussionPost>>(`/discussion-posts/${slug}`),

  create: (data: FormData) =>
    api.post<ApiResponse<DiscussionPost>>("/discussion-posts", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (slug: string, data: FormData) =>
    api.post<ApiResponse<DiscussionPost>>(`/discussion-posts/${slug}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (slug: string) =>
    api.delete<ApiResponse<void>>(`/discussion-posts/${slug}`),

  toggleLike: (slug: string) =>
    api.post<ApiResponse<{ liked: boolean; likes_count: number }>>(`/discussion-posts/${slug}/like`),

  getComments: (slug: string, params?: { page?: number; per_page?: number }) =>
    api.get<ApiResponse<PaginatedResponse<any>>>(`/discussion-posts/${slug}/comments`, { params }),

  createComment: (slug: string, data: { content: string; parent_id?: number }) =>
    api.post<ApiResponse<any>>(`/discussion-posts/${slug}/comments`, data),
};
