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
  login: (email: string, password: string, recaptcha_token?: string | null) =>
    api.post<ApiResponse<LoginResponse>>("/auth/login", {
      email,
      password,
      ...(recaptcha_token ? { recaptcha_token } : {}),
    }),

  register: (
    email: string,
    password: string,
    password_confirmation: string,
    recaptcha_token?: string | null,
  ) =>
    api.post<ApiResponse<RegisterResponse>>("/auth/register", {
      email,
      password,
      password_confirmation,
      ...(recaptcha_token ? { recaptcha_token } : {}),
    }),

  setupProfile: (data: FormData) =>
    api.post<ApiResponse<SetupProfileResponse>>("/auth/setup-profile", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  me: () => api.get<ApiResponse<MeResponse>>("/auth/me"),

  logout: () => api.post<ApiResponse<null>>("/auth/logout"),

  forgotPassword: (email: string, recaptcha_token?: string | null) =>
    api.post<ApiResponse<{ email: string }>>("/auth/forgot-password", {
      email,
      ...(recaptcha_token ? { recaptcha_token } : {}),
    }),

  resetPassword: (
    email: string,
    token: string,
    password: string,
    password_confirmation: string,
  ) =>
    api.post<ApiResponse<null>>("/auth/reset-password", {
      email,
      token,
      password,
      password_confirmation,
    }),

  changePassword: (data: Record<string, string>) =>
    api.post<ApiResponse<null>>("/auth/change-password", data),
};
