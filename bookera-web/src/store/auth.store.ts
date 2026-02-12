"use client";

import { create } from "zustand";
import { setCookie, deleteCookie } from "cookies-next";
import { authService } from "@/services/auth.service";
import { User } from "@/types/user";
import { useSidebarStore } from "./sidebar.store";

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  initialLoading: boolean;

  login: (email: string, password: string) => Promise<string>;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
  setInitialLoadingComplete: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  isAuthenticated: false,
  initialLoading: true,

  login: async (email, password) => {
    try {
      set({ loading: true });

      const res = await authService.login(email, password);

      const { token, user } = res.data.data;

      setCookie("token", token, { maxAge: 60 * 60 * 24 });
      setCookie("role", user.role, { maxAge: 60 * 60 * 24 });

      set({
        user,
        isAuthenticated: true,
        loading: false,
      });

      return res.data.message;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  fetchUser: async () => {
    try {
      const res = await authService.me();
      set({
        user: res.data.data.user,
        isAuthenticated: true,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
      });
    } finally {
      // Add delay before hiding loading to ensure smooth transition
      setTimeout(() => {
        set({ initialLoading: false });
      }, 800);
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      deleteCookie("token");
      deleteCookie("role");

      // Reset sidebar to expanded state
      useSidebarStore.getState().setCollapsed(false);

      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },

  setInitialLoadingComplete: () => {
    set({ initialLoading: false });
  },
}));
