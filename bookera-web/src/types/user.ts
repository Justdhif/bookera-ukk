export interface UserProfile {
  id: number;
  full_name: string;
  gender: string;
  birth_date: string | null;
  avatar: string | null;
  phone_number: string | null;
  address: string | null;
  bio: string | null;
}

export interface User {
  id: number;
  email: string;
  role: "admin" | "student" | "teacher" | "staff";
  is_active: boolean;
  last_login_at: string;
  profile: UserProfile;
  student_detail: any;
  teacher_detail: any;
  staff_detail: any;
}
