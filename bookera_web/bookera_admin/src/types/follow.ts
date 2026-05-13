import { User } from "./user";

export type FollowableType = "user";

export interface FollowedUser {
  id: number;
  email: string;
  follow_id: number;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name?: string;
    avatar?: string;
  };
}

export interface UserFollowRecord {
  id: number;
  user_id: number;
  followable_id: number;
  followable_type: string;
  created_at: string;
  updated_at: string;
  user?: User;
  followable?: User;
}

export interface FollowCounts {
  followers_count: number;
  following_count: number;
}
