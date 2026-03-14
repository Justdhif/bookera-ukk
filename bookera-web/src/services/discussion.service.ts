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
} from "@/types/discussion";

export interface CreatePostData {
  caption?: string;
  images?: File[];
}

export interface UpdatePostData {
  caption?: string;
  images?: File[];
}

export const discussionPostService = {
  getPosts: (params?: { per_page?: number; page?: number }) =>
    api.get<ApiResponse<DiscussionPostListResponse>>("/discussion-posts", {
      params,
    }),

  getPostsByUser: (
    userSlug: string,
    params?: { per_page?: number; page?: number },
  ) =>
    api.get<ApiResponse<DiscussionPostListResponse>>(
      `/discussion-posts/user/${userSlug}`,
      { params },
    ),

  getPost: (slug: string) =>
    api.get<ApiResponse<DiscussionPost>>(`/discussion-posts/${slug}`),

  getFollowingPosts: (params?: { per_page?: number; page?: number }) =>
    api.get<ApiResponse<DiscussionPostListResponse>>(
      "/discussion-posts/feed/following",
      { params },
    ),

  createPost: (data: CreatePostData) => {
    const formData = new FormData();
    if (data.caption) formData.append("caption", data.caption);
    data.images?.forEach((f) => formData.append("images[]", f));
    return api.post<ApiResponse<DiscussionPost>>("/discussion-posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updatePost: (slug: string, data: UpdatePostData) => {
    const formData = new FormData();
    if (data.caption) formData.append("caption", data.caption);
    data.images?.forEach((f) => formData.append("images[]", f));
    return api.post<ApiResponse<DiscussionPost>>(`/discussion-posts/${slug}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      params: { _method: "PUT" },
    });
  },

  deletePost: (slug: string) =>
    api.delete<ApiResponse<null>>(`/discussion-posts/${slug}`),

  reportPost: (slug: string, data: { reason: PostReportReason; description?: string }) =>
    api.post<ApiResponse<DiscussionPostReport>>(`/discussion-posts/${slug}/report`, data),
};

export const discussionLikeService = {
  toggleLike: (slug: string) =>
    api.post<ApiResponse<{ liked: boolean; likes_count: number }>>(
      `/discussion-posts/${slug}/like`,
    ),
};

export const discussionCommentService = {
  getComments: (slug: string, params?: { per_page?: number; page?: number }) =>
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

  addComment: (
    slug: string,
    data: { content: string; parent_id?: number | null },
  ) =>
    api.post<ApiResponse<DiscussionComment>>(
      `/discussion-posts/${slug}/comments`,
      data,
    ),

  updateComment: (commentId: number, data: { content: string }) =>
    api.put<ApiResponse<DiscussionComment>>(
      `/discussion-comments/${commentId}`,
      data,
    ),

  deleteComment: (commentId: number) =>
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

export interface ReviewReportData {
  status: PostReportStatus;
  admin_note?: string;
  takedown?: boolean;
  takedown_reason?: string;
}

export const adminDiscussionService = {
  getReports: (params?: { per_page?: number; page?: number; status?: PostReportStatus }) =>
    api.get<ApiResponse<DiscussionPostReportListResponse>>("/admin/discussion-posts/reports", { params }),

  reviewReport: (reportId: number, data: ReviewReportData) =>
    api.patch<ApiResponse<DiscussionPostReport>>(`/admin/discussion-posts/reports/${reportId}`, data),

  takedownPost: (slug: string, data?: { reason?: string }) =>
    api.patch<ApiResponse<DiscussionPost>>(`/admin/discussion-posts/${slug}/takedown`, data ?? {}),

  restorePost: (slug: string) =>
    api.patch<ApiResponse<DiscussionPost>>(`/admin/discussion-posts/${slug}/restore`),
};
