export interface UserProfile {
  id: number;
  user_id: number;
  full_name: string;
  gender: "male" | "female" | "prefer_not_to_say" | null;
  birth_date: string | null;
  avatar: string;
  phone_number: string | null;
  address: string | null;
  bio: string | null;
  identification_number: string | null;
  occupation: string | null;
  institution: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  role: "admin" | "officer:catalog" | "officer:management" | "user";
  is_active: boolean;
  last_login_at: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;

  profile: UserProfile;
}
