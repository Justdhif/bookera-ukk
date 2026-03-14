"use client";

import { useAuthStore } from "@/store/auth.store";
import AppHeader from "@/components/custom-ui/navbar/AppHeader";

export default function DiscussionHeader() {
  const { isAuthenticated } = useAuthStore();

  return (
    <AppHeader isAuthenticated={isAuthenticated} />
  );
}
