"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import AppHeader from "./AppHeader";

export default function PublicHeader() {
  const t = useTranslations("navbar");
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");



  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isHomePage = pathname === "/";

  const leftContent = (
    <div className="flex items-center gap-2 md:gap-4 flex-1 max-w-md w-full ml-1 lg:ml-0">
      <Link href="/">
        <Button
          variant="outline"
          size="icon"
          className={`h-9 w-9 rounded-full shrink-0 ${
            isHomePage
              ? "bg-primary/10 text-primary hover:bg-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
          aria-label={t("goToHome")}
        >
          <Home className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </Link>

      <form onSubmit={handleSearch} className="relative flex-1">
        <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
        <Input
          placeholder={t("bookSearchPlaceholder")}
          className="pl-9 md:pl-12 pr-3 md:pr-4 h-10 md:h-12 bg-muted/30 border-border focus-visible:ring-1 focus-visible:ring-ring rounded-full text-sm md:text-base w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>
    </div>
  );



  return (
      <AppHeader
        leftContent={leftContent}
        isAuthenticated={isAuthenticated}
      />
  );
}
