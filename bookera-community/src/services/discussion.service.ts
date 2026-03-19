import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  DiscussionPost,
  DiscussionComment,
  DiscussionPostListResponse,
  DiscussionCommentListResponse,
  DiscussionPostReportListResponse,
  UserFollowerListResponse,
  FollowCounts,
  PostReportReason,
  PostReportStatus,
  DiscussionPostReport,
  CreatePostData,
  UpdatePostData,
  ReviewReportData,
} from "@/types/discussion";
import { buildDiscussionPostFormData } from "./form-data/discussion.form-data";

export const discussionPostService = {
  getAll: (params?: { per_page?: number; page?: number }) =>
    api.get<ApiResponse<DiscussionPostListResponse>>("/discussion-posts", {
      params,
    }),

  getByUser: (
    userSlug: string,
    params?: { per_page?: number; page?: number },
  ) =>
    api.get<ApiResponse<DiscussionPostListResponse>>(
      `/discussion-posts/user/${userSlug}`,
      { params },
    ),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<DiscussionPost>>(`/discussion-posts/${slug}`),

  getByFollowing: (params?: { per_page?: number; page?: number }) =>
    api.get<ApiResponse<DiscussionPostListResponse>>(
      "/discussion-posts/feed/following",
      { params },
    ),

  create: (data: CreatePostData) =>
    api.post<ApiResponse<DiscussionPost>>(
      "/discussion-posts",
      buildDiscussionPostFormData(data),
      { headers: { "Content-Type": "multipart/form-data" } },
    ),

  update: (slug: string, data: UpdatePostData) =>
    api.post<ApiResponse<DiscussionPost>>(
      `/discussion-posts/${slug}`,
      buildDiscussionPostFormData(data),
      {
        headers: { "Content-Type": "multipart/form-data" },
        params: { _method: "PUT" },
      },
    ),

  delete: (slug: string) =>
    api.delete<ApiResponse<null>>(`/discussion-posts/${slug}`),

  reportPost: (
    slug: string,
    data: { reason: PostReportReason; description?: string },
  ) =>
    api.post<ApiResponse<DiscussionPostReport>>(
      `/discussion-posts/${slug}/report`,
      data,
    ),
};

export const discussionLikeService = {
  toggleLike: (slug: string) =>
    api.post<ApiResponse<{ liked: boolean; likes_count: number }>>(
      `/discussion-posts/${slug}/like`,
    ),
};

export const discussionCommentService = {
  getAll: (slug: string, params?: { per_page?: number; page?: number }) =>
    api.get<ApiResponse<DiscussionCommentListResponse>>(
      `/discussion-posts/${slug}/comments`,
      { params },
    ),

  getReplies: (
    commentId: number,
    params?: { per_page?: number; page?: number },
  ) =>
    api.get<ApiResponse<DiscussionCommentListResponse>>(
      `/discussion-comments/${commentId}/replies`,
      { params },
    ),

  create: (
    slug: string,
    data: { content: string; parent_id?: number | null },
  ) =>
    api.post<ApiResponse<DiscussionComment>>(
      `/discussion-posts/${slug}/comments`,
      data,
    ),

  update: (commentId: number, data: { content: string }) =>
    api.put<ApiResponse<DiscussionComment>>(
      `/discussion-comments/${commentId}`,
      data,
    ),

  delete: (commentId: number) =>
    api.delete<ApiResponse<null>>(`/discussion-comments/${commentId}`),
};

export const userFollowerService = {
  follow: (userId: number) =>
    api.post<ApiResponse<{ follow_id: number }>>("/follows", {
      type: "user",
      id: userId,
    }),

  unfollow: (userId: number) =>
    api.delete<ApiResponse<null>>("/follows", {
      data: { type: "user", id: userId },
    }),

  checkFollow: (userId: number) =>
    api.get<ApiResponse<{ is_following: boolean }>>("/follows/check", {
      params: { type: "user", id: userId },
    }),

  getFollowers: (
    userSlug: string,
    params?: { per_page?: number; page?: number },
  ) =>
    api.get<ApiResponse<UserFollowerListResponse>>(
      `/users/${userSlug}/followers`,
      { params },
    ),

  getFollowing: (
    userSlug: string,
    params?: { per_page?: number; page?: number },
  ) =>
    api.get<ApiResponse<UserFollowerListResponse>>(
      `/users/${userSlug}/following`,
      { params },
    ),

  getFollowCounts: (userSlug: string) =>
    api.get<ApiResponse<FollowCounts>>(`/users/${userSlug}/follow-counts`),

  getUserPublicProfile: (userSlug: string) =>
    api.get<ApiResponse<import("@/types/user").User>>(
      `/users/${userSlug}/profile`,
    ),
};

export const adminDiscussionService = {
  getReports: (params?: {
    per_page?: number;
    page?: number;
    status?: PostReportStatus;
  }) =>
    api.get<ApiResponse<DiscussionPostReportListResponse>>(
      "/admin/discussion-posts/reports",
      { params },
    ),

  reviewReport: (reportId: number, data: ReviewReportData) =>
    api.patch<ApiResponse<DiscussionPostReport>>(
      `/admin/discussion-posts/reports/${reportId}`,
      data,
    ),

  takedownPost: (slug: string, data?: { reason?: string }) =>
    api.patch<ApiResponse<DiscussionPost>>(
      `/admin/discussion-posts/${slug}/takedown`,
      data ?? {},
    ),

  restorePost: (slug: string) =>
    api.patch<ApiResponse<DiscussionPost>>(
      `/admin/discussion-posts/${slug}/restore`,
    ),
};
