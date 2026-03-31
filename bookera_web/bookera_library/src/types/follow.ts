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

/** A record from the `follows` table returned by user-followers endpoints */
export interface UserFollowRecord {
  id: number;
  user_id: number;
  followable_id: number;
  followable_type: string;
  created_at: string;
  updated_at: string;
  /** Present in getUserFollowers — the user who is following */
  user?: User;
  /** Present in getUserFollowing — the user being followed */
  followable?: User;
}

export interface FollowCounts {
  followers_count: number;
  following_count: number;
}
