import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  DiscussionPost,
  DiscussionComment,
  DiscussionUser,
  DiscussionPostListResponse,
  DiscussionCommentListResponse,
  UserFollowerListResponse,
  FollowCounts,
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
    userId: number,
    params?: { per_page?: number; page?: number },
  ) =>
    api.get<ApiResponse<DiscussionPostListResponse>>(
      `/discussion-posts/user/${userId}`,
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

  getActiveUsers: () =>
    api.get<ApiResponse<DiscussionUser[]>>("/discussion-posts/active-users"),
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
    userId: number,
    params?: { per_page?: number; page?: number },
  ) =>
    api.get<ApiResponse<UserFollowerListResponse>>(
      `/users/${userId}/followers`,
      { params },
    ),

  getFollowing: (
    userId: number,
    params?: { per_page?: number; page?: number },
  ) =>
    api.get<ApiResponse<UserFollowerListResponse>>(
      `/users/${userId}/following`,
      { params },
    ),

  getFollowCounts: (userId: number) =>
    api.get<ApiResponse<FollowCounts>>(`/users/${userId}/follow-counts`),

  getUserPublicProfile: (userId: number) =>
    api.get<ApiResponse<import("@/types/user").User>>(
      `/users/${userId}/profile`,
    ),
};
