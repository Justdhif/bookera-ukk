import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { User } from "@/types/user";

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterResponse {
  token: string;
  user: User;
}

interface SetupProfileResponse {
  user: User;
}

interface MeResponse {
  user: User;
}

export const authService = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<LoginResponse>>("/auth/login", {
      email,
      password,
    }),

  register: (email: string, password: string, password_confirmation: string) =>
    api.post<ApiResponse<RegisterResponse>>("/auth/register", {
      email,
      password,
      password_confirmation,
    }),

  setupProfile: (data: FormData) =>
    api.post<ApiResponse<SetupProfileResponse>>("/auth/setup-profile", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  me: () => api.get<ApiResponse<MeResponse>>("/auth/me"),

  logout: () => api.post<ApiResponse<null>>("/auth/logout"),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<{ email: string }>>("/auth/forgot-password", {
      email,
    }),

  resetPassword: (
    email: string,
    token: string,
    password: string,
    password_confirmation: string
  ) =>
    api.post<ApiResponse<null>>("/auth/reset-password", {
      email,
      token,
      password,
      password_confirmation,
    }),
};
