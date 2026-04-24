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

const EXCLUDED_PATHS = [
  "/landing-page",
  "/home",
  "/login",
  "/forgot-password",
  "/setup-profile",
];

export default function Providers({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!getCookie(COOKIE_NAME)) {
      setCookie(COOKIE_NAME, defaultLocale, COOKIE_OPTIONS);
    }    
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (pathname === "/") {
      router.replace("/landing-page");
    }
  }, [pathname, router]);

  return <>{children}</>;
}
