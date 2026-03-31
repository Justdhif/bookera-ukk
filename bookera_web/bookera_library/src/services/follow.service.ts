import api from "@/lib/axios";
import { ApiResponse, PaginatedResponse } from "@/types/api";
import { FollowedUser, FollowableType, UserFollowRecord } from "@/types/follow";
import { FollowCounts } from "@/types/follow";
import { User } from "@/types/user";

export const followService = {
  getFollowedUsers: () =>
    api.get<ApiResponse<FollowedUser[]>>("/follows/users"),

  getUserFollowers: (
    userSlug: string,
    params?: { per_page?: number; page?: number },
  ) =>
    api.get<ApiResponse<PaginatedResponse<UserFollowRecord>>>(
      `/users/${userSlug}/followers`,
      { params },
    ),

  getUserFollowing: (
    userSlug: string,
    params?: { per_page?: number; page?: number },
  ) =>
    api.get<ApiResponse<PaginatedResponse<UserFollowRecord>>>(
      `/users/${userSlug}/following`,
      { params },
    ),

  getUserFollowCounts: (userSlug: string) =>
    api.get<ApiResponse<FollowCounts>>(`/users/${userSlug}/follow-counts`),

  getUserPublicProfile: (userSlug: string) =>
    api.get<ApiResponse<User>>(`/users/${userSlug}/profile`),

  follow: (type: FollowableType, id: number) =>
    api.post<ApiResponse<{ follow_id: number }>>("/follows", { type, id }),

  unfollow: (type: FollowableType, id: number) =>
    api.delete<ApiResponse<null>>("/follows", { data: { type, id } }),

  check: (type: FollowableType, id: number) =>
    api.get<ApiResponse<{ is_following: boolean }>>("/follows/check", {
      params: { type, id },
    }),
};
