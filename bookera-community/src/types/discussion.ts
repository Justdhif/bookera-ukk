import { User } from "./user";
import { PaginatedResponse } from "./api";

export interface DiscussionPostImage {
  id: number;
  post_id: number;
  image_path: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface DiscussionPost {
  id: number;
  user_id: number;
  caption: string | null;
  slug: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  taken_down_at: string | null;
  taken_down_reason: string | null;
  created_at: string;
  updated_at: string;
  user: User;
  images: DiscussionPostImage[];
  followed_likers?: User[];
}

export type PostReportReason =
  | "spam"
  | "harassment"
  | "hate_speech"
  | "misinformation"
  | "inappropriate_content"
  | "other";

export type PostReportStatus = "pending" | "reviewed" | "dismissed";

export interface DiscussionPostReport {
  id: number;
  reporter_id: number;
  post_id: number;
  reason: PostReportReason;
  description: string | null;
  status: PostReportStatus;
  reviewed_by: number | null;
  reviewed_at: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  reporter?: User;
  post?: DiscussionPost;
  reviewer?: User;
}

export interface DiscussionComment {
  id: number;
  user_id: number;
  post_id: number;
  parent_id: number | null;
  content: string;
  created_at: string;
  updated_at: string;
  user: User;
  replies?: DiscussionComment[];
}

export interface UserFollower {
  id: number;
  user_id: number;
  followable_id: number;
  followable_type: string;
  created_at: string;
  updated_at: string;
  /** Present in getFollowers response — the user who is following */
  user?: User;
  /** Present in getFollowing response — the user being followed */
  followable?: User;
}

export interface FollowCounts {
  followers_count: number;
  following_count: number;
}

export interface DiscussionUser {
  id: number;
  email: string;
  slug?: string;
  role: string;
  is_following: boolean;
  profile?: {
    full_name?: string;
    avatar?: string;
  };
}

export type DiscussionPostListResponse = PaginatedResponse<DiscussionPost>;
export type DiscussionCommentListResponse = PaginatedResponse<DiscussionComment>;
export type UserFollowerListResponse = PaginatedResponse<UserFollower>;
export type DiscussionPostReportListResponse = PaginatedResponse<DiscussionPostReport>;

export interface CreatePostData {
  caption?: string;
  images?: File[];
}

export interface UpdatePostData {
  caption?: string;
  images?: File[];
}

export interface ReviewReportData {
  status: PostReportStatus;
  admin_note?: string;
  takedown?: boolean;
  takedown_reason?: string;
}
