"use client";

import { useAuthStore } from "@/store/auth.store";
import { useState, useEffect } from "react";
import AppHeader from "./AppHeader";
import PublicHeaderSearch from "./PublicHeaderSearch";

export default function PublicHeader() {
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AppHeader leftContent={<PublicHeaderSearch />} isAuthenticated={isAuthenticated} />
  );
}
