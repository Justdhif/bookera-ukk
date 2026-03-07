import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
  FollowedAuthor,
  FollowedPublisher,
  FollowableType,
  AuthorDetail,
  PublisherDetail,
} from "@/types/follow";

export const followService = {
  getFollowedAuthors: () =>
    api.get<ApiResponse<FollowedAuthor[]>>("/follows/authors"),

  getFollowedPublishers: () =>
    api.get<ApiResponse<FollowedPublisher[]>>("/follows/publishers"),

  follow: (type: FollowableType, id: number) =>
    api.post<ApiResponse<{ follow_id: number }>>("/follows", { type, id }),

  unfollow: (type: FollowableType, id: number) =>
    api.delete<ApiResponse<null>>("/follows", { data: { type, id } }),

  check: (type: FollowableType, id: number) =>
    api.get<ApiResponse<{ is_following: boolean }>>("/follows/check", {
      params: { type, id },
    }),

  getAuthorDetail: (slug: string) =>
    api.get<ApiResponse<AuthorDetail>>(`/follows/authors/${slug}`),

  getPublisherDetail: (slug: string) =>
    api.get<ApiResponse<PublisherDetail>>(`/follows/publishers/${slug}`),
};
