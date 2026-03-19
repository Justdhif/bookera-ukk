import api from "@/lib/axios";
import { ApiResponse, PaginatedResponse } from "@/types/api";
import {
  FollowedAuthor,
  FollowedPublisher,
  FollowedUser,
  FollowableType,
  FollowableDetail,
  UserFollowRecord,
} from "@/types/follow";
import { FollowCounts } from "@/types/follow";
import { User } from "@/types/user";

export const followService = {
  getFollowedAuthors: () =>
    api.get<ApiResponse<FollowedAuthor[]>>("/follows/authors"),

  getFollowedPublishers: () =>
    api.get<ApiResponse<FollowedPublisher[]>>("/follows/publishers"),

  getFollowableDetail: (type: "author" | "publisher", slug: string) =>
    api.get<ApiResponse<FollowableDetail>>(`/follows/${type}s/${slug}`),

  getFollowedUsers: () =>
    api.get<ApiResponse<FollowedUser[]>>("/follows/users"),

  getUserFollowers: (userId: number, params?: { per_page?: number; page?: number }) =>
    api.get<ApiResponse<PaginatedResponse<UserFollowRecord>>>(
      `/users/${userId}/followers`,
      { params },
    ),

  getUserFollowing: (userId: number, params?: { per_page?: number; page?: number }) =>
    api.get<ApiResponse<PaginatedResponse<UserFollowRecord>>>(
      `/users/${userId}/following`,
      { params },
    ),

  getUserFollowCounts: (userId: number) =>
    api.get<ApiResponse<FollowCounts>>(`/users/${userId}/follow-counts`),

  getUserPublicProfile: (userId: number) =>
    api.get<ApiResponse<User>>(`/users/${userId}/profile`),

  follow: (type: FollowableType, id: number) =>
    api.post<ApiResponse<{ follow_id: number }>>("/follows", { type, id }),

  unfollow: (type: FollowableType, id: number) =>
    api.delete<ApiResponse<null>>("/follows", { data: { type, id } }),

  check: (type: FollowableType, id: number) =>
    api.get<ApiResponse<{ is_following: boolean }>>("/follows/check", {
      params: { type, id },
    }),
};
