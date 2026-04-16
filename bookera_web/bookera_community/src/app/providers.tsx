"use client";

import { useEffect } from "react";
import { getCookie, setCookie } from "cookies-next";
import { defaultLocale } from "@/i18n/config";
import { useAuthStore } from "@/store/auth.store";

const COOKIE_NAME = "NEXT_LOCALE";
const COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 365,
};

export default function Providers({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    if (!getCookie(COOKIE_NAME)) {
      setCookie(COOKIE_NAME, defaultLocale, COOKIE_OPTIONS);
    }

    fetchUser();
  }, [fetchUser]);

  return <>{children}</>;
}
