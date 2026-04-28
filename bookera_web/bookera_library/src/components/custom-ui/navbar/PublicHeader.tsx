"use client";

import { useAuthStore } from "@/store/auth.store";
import { useState, useEffect } from "react";
import AppHeader from "./AppHeader";

export default function PublicHeader() {
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AppHeader
      leftContent={
        <div className="flex items-center px-2">
          <span className="text-2xl font-black tracking-tighter text-primary">
            Bookera
          </span>
        </div>
      }
      isAuthenticated={isAuthenticated}
    />
  );
}
