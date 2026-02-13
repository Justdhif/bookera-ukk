"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";

export default function Providers({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Initialize real-time notifications once at app level
  useRealTimeNotifications();

  return <>{children}</>;
}
