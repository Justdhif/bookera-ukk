"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Bell, Home, Settings, User, LayoutDashboard, LogOut } from "lucide-react";
import { useState, useEffect, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import NotificationDropdown from "./NotificationDropdown";

export default function PublicHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated, initialLoading } = useAuthStore();
  const t = useTranslations("header");
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

  return (
    <header className="sticky top-0 bg-background/95 backdrop-blur-md z-40 border-b border-border shadow-sm">
      <div className="px-4 md:px-6 lg:px-8 py-3 md:py-4">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-4 flex-1 max-w-md">
            {/* Home button - only visible on mobile */}
            <div className="lg:hidden">
              <Button
                variant={isHomePage ? "secondary" : "ghost"}
                size="icon"
                onClick={() => router.push("/")}
                className={`h-9 w-9 rounded-full ${
                  isHomePage
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
                aria-label="Go to home"
              >
                <Home className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>

            <div className="hidden lg:block">
              <SidebarTrigger />
            </div>
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
              <Input
                placeholder={t("placeholder")}
                className="pl-9 md:pl-12 pr-3 md:pr-4 h-10 md:h-12 bg-muted/30 border-border focus-visible:ring-1 focus-visible:ring-ring rounded-full text-sm md:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <div className="flex items-center gap-1.5 md:gap-3">
            <NotificationDropdown isAuthenticated={isAuthenticated} />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/settings")}
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
              aria-label="Go to settings"
            >
              <Settings className="h-4 w-4 md:h-5 md:w-5" />
            </Button>

            <div className="shrink-0">
              {initialLoading ? (
                <Skeleton className="h-8 w-8 md:h-10 md:w-10 rounded-full" />
              ) : !isAuthenticated ? (
                <Button
                  onClick={() => router.push("/login")}
                  size="sm"
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 md:px-8 h-8 md:h-10 text-sm md:text-base"
                >
                  {t("login")}
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-full ring-2 ring-transparent hover:ring-ring transition-all">
                    <Avatar className="h-8 w-8 md:h-10 md:w-10">
                      <AvatarImage
                        src={user?.profile?.avatar}
                        alt={user?.profile?.full_name || user?.email || "User"}
                      />
                      <AvatarFallback className="bg-linear-to-br from-brand-primary to-brand-primary-dark text-xs md:text-sm text-white">
                        {user?.profile?.full_name?.[0] || user?.email?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem disabled className="flex-col items-start font-semibold">
                      <div className="relative">
                        <span>{user?.profile?.full_name}</span>
                        <div className="absolute -bottom-1 left-0 h-1 w-8 rounded-full bg-brand-primary"></div>
                      </div>
                      <span className="text-muted-foreground text-xs">Role : {user?.role}</span>
                    </DropdownMenuItem>

                    {(user?.role === "admin" ||
                      user?.role?.startsWith("officer:")) && (
                      <DropdownMenuItem onClick={() => router.push("/admin")} className="gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        {t("dashboard")}
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      onClick={() => router.push("/profile")}
                      className="gap-2"
                    >
                      <User className="h-4 w-4" />
                      {t("profile")}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="text-red-600 dark:text-red-400 focus:text-red-600 gap-2"
                      onClick={logout}
                    >
                      <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                      {t("logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
