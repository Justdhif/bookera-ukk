import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { User } from "@/types/user";

interface LoginResponse {
  token: string;
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

  me: () => api.get<ApiResponse<MeResponse>>("/auth/me"),

  logout: () => api.post<ApiResponse<null>>("/auth/logout"),
};
