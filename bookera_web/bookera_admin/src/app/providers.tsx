"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCookie, setCookie } from "cookies-next";
import { defaultLocale } from "@/i18n/config";
import { useAuthStore } from "@/store/auth.store";

const COOKIE_NAME = "NEXT_LOCALE";
const COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 365,
};

const AUTH_PATHS = [
  "/login",
  "/forgot-password",
  "/setup-profile",
  "/activate",
];

const ADMIN_ROLES = ["admin", "officer:catalog", "officer:management"];

export default function Providers({ children }: { children: React.ReactNode }) {
  const { user, fetchUser, isAuthenticated, initialLoading } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!getCookie(COOKIE_NAME)) {
      setCookie(COOKIE_NAME, defaultLocale, COOKIE_OPTIONS);
    }
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    // Role protection: if authenticated but not admin role, redirect to forbidden
    if (!initialLoading && isAuthenticated && user) {
      const isAuthPath = AUTH_PATHS.some(path => pathname.startsWith(path));
      const isAdminRole = ADMIN_ROLES.includes(user.role);

      if (!isAdminRole && pathname !== "/forbidden") {
        router.push("/forbidden");
      } else if (isAdminRole && isAuthPath) {
        router.push("/");
      }
    }
  }, [pathname, router, user, isAuthenticated, initialLoading]);

  return <>{children}</>;
}
