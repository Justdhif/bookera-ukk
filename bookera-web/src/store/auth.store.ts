"use client";

import { create } from "zustand";
import { setCookie, deleteCookie } from "cookies-next";
import { authService } from "@/services/auth.service";
import { User } from "@/types/user";

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  isAuthenticated: false,

  login: async (email, password) => {
    set({ loading: true });

    const res = await authService.login(email, password);
    const { token, user } = res.data;

    setCookie("token", token, { maxAge: 60 * 60 * 24 });
    setCookie("role", user.role, { maxAge: 60 * 60 * 24 });

    set({
      user,
      isAuthenticated: true,
      loading: false,
    });
  },

  fetchUser: async () => {
    try {
      const res = await authService.me();
      set({
        user: res.data.user,
        isAuthenticated: true,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      deleteCookie("token");
      deleteCookie("role");

      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },
}));
