"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, ChevronRight, LogIn, LogOut, Users } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import LogoutConfirmDialog from "@/components/custom-ui/modal/LogoutConfirmDialog";
import { useTranslations } from "next-intl";

import { usePathnameCondition } from "@/hooks/usePathnameCondition";

export function SidebarUserFooter() {
  const t = useTranslations("sidebar");
  const { pathname, isAdmin } = usePathnameCondition();
  const router = useRouter();

  const { open } = useSidebar();
  const { user, isAuthenticated, initialLoading, logout } = useAuthStore();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = React.useState(false);

  const hasAdminRole =
    user?.role === "admin" || user?.role?.startsWith("officer:");

  const showBackButton = isAdmin || hasAdminRole;
  const backHref = isAdmin ? "/" : "/admin";
  const backLabelKey = isAdmin ? "publicPage" : "dashboard";
  const profileHref = user?.slug ? `/${user.slug}/profile` : "/profile";

  const backLabel = t(backLabelKey);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = async () => {
    await logout();
    router.push("/");
  };

  return (
    <>
      <TooltipProvider delayDuration={0}>
        <SidebarMenu className="gap-2 p-2">
          {showBackButton && (
            <SidebarMenuItem
              className={cn(!open && "w-full flex justify-center")}
            >
              <SidebarMenuButton
                asChild
                tooltip={{ content: backLabel }}
                className={cn(
                  "rounded-xl hover:bg-brand-primary/8 dark:hover:bg-brand-primary/15 transition-all group/back",
                  !open && "justify-center px-0 mx-auto",
                )}
              >
                <Link href={backHref}>
                  <div
                    className={cn(
                      open ? "p-1.5" : "p-2",
                      "rounded-lg bg-linear-to-br from-brand-primary to-brand-primary-dark text-white shadow-sm group-hover/back:shadow-md transition-shadow shrink-0",
                    )}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                  </div>
                  {open && <span className="font-medium">{backLabel}</span>}
                  {open && (
                    <ChevronRight className="h-3 w-3 text-muted-foreground/50 group-hover/back:text-brand-primary group-hover/back:translate-x-0.5 transition-all ml-auto" />
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem
            className={cn(!open && "w-full flex justify-center")}
          >
            <SidebarMenuButton
              asChild
              tooltip={{ content: t("community") }}
              className={cn(
                "rounded-xl hover:bg-brand-primary/8 dark:hover:bg-brand-primary/15 transition-all group/community",
                !open && "justify-center px-0 mx-auto",
              )}
            >
              <a href={typeof window !== "undefined" ? `${window.location.protocol}//${window.location.hostname}:4000` : "http://localhost:4000"}>
                <div
                  className={cn(
                    open ? "p-1.5" : "p-2",
                    "rounded-lg bg-linear-to-br from-brand-primary/10 to-brand-primary/20 text-brand-primary shadow-sm group-hover/community:shadow-md transition-shadow shrink-0",
                  )}
                >
                  <Users className="h-3.5 w-3.5" />
                </div>
                {open && <span className="font-medium">{t("community")}</span>}
                {open && (
                  <ChevronRight className="h-3 w-3 text-muted-foreground/50 group-hover/community:text-brand-primary group-hover/community:translate-x-0.5 transition-all ml-auto" />
                )}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {isAuthenticated && (
            <SidebarMenuItem
              className={cn(!open && "w-full flex justify-center")}
            >
              <SidebarMenuButton
                onClick={handleLogout}
                tooltip={{ content: t("logout") }}
                className={cn(
                  "rounded-xl text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all",
                  !open && "justify-center px-0 mx-auto",
                )}
              >
                <div
                  className={cn(
                    open ? "p-1.5" : "p-2",
                    "rounded-lg bg-linear-to-br from-red-500/15 to-rose-500/15 shrink-0",
                  )}
                >
                  <LogOut className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                </div>
                {open && (
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {t("logout")}
                  </span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem
            className={cn(!open && "w-full flex justify-center")}
          >
            {initialLoading ? (
              <div
                className={cn(
                  "h-auto py-3 px-2",
                  !open && "flex justify-center",
                )}
              >
                <div
                  className={cn(
                    "flex items-center w-full",
                    open ? "gap-3" : "justify-center",
                  )}
                >
                  <div className="relative shrink-0">
                    <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                  </div>
                  {open && (
                    <div className="flex flex-col items-start flex-1 min-w-0 gap-1.5">
                      <div className="h-3.5 bg-muted rounded w-24 animate-pulse" />
                      <div className="h-3 bg-muted rounded w-32 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            ) : isAuthenticated && user ? (
              open ? (
                <Link href={profileHref}>
                  <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-brand-primary/8 hover:bg-brand-primary/15 dark:bg-brand-primary/10 dark:hover:bg-brand-primary/20 border border-brand-primary/15 hover:border-brand-primary/30 transition-all cursor-pointer group">
                    <div className="relative shrink-0">
                      <Avatar className="h-9 w-9 ring-2 ring-brand-primary/20 group-hover:ring-brand-primary/50 transition-all group-hover:scale-105 shadow-sm">
                        <AvatarImage
                          src={user.profile?.avatar}
                          alt={user.profile?.full_name || user.email || "User"}
                        />
                        <AvatarFallback className="bg-linear-to-br from-brand-primary to-brand-primary-dark text-white font-semibold text-sm">
                          {user.profile?.full_name?.[0]?.toUpperCase() ||
                            user.email?.[0]?.toUpperCase() ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-linear-to-br from-green-400 to-emerald-500 border-2 border-background shadow-sm" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-semibold truncate group-hover:text-brand-primary transition-colors">
                        {user.profile?.full_name || user.email}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </Link>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={profileHref} className="flex justify-center">
                      <div className="relative">
                        <Avatar className="h-9 w-9 ring-2 ring-brand-primary/20 hover:ring-brand-primary/50 transition-all hover:scale-105 shadow-sm cursor-pointer">
                          <AvatarImage
                            src={user.profile?.avatar}
                            alt={
                              user.profile?.full_name || user.email || "User"
                            }
                          />
                          <AvatarFallback className="bg-linear-to-br from-brand-primary to-brand-primary-dark text-white font-semibold text-sm">
                            {user.profile?.full_name?.[0]?.toUpperCase() ||
                              user.email?.[0]?.toUpperCase() ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-linear-to-br from-green-400 to-emerald-500 border-2 border-background shadow-sm" />
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {user.profile?.full_name || user.email}
                  </TooltipContent>
                </Tooltip>
              )
            ) : !initialLoading ? (
              open ? (
                <Link href="/login">
                  <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-muted/50 hover:bg-muted border border-border/60 hover:border-border transition-all cursor-pointer group">
                    <div className="relative shrink-0">
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center ring-2 ring-border group-hover:ring-brand-primary/40 transition-all">
                        <LogIn className="h-4 w-4 text-muted-foreground group-hover:text-brand-primary transition-colors" />
                      </div>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-semibold truncate group-hover:text-brand-primary transition-colors">
                        {t("signIn")}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {t("signInToAccess")}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </Link>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/login" className="flex justify-center">
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center ring-2 ring-border hover:ring-brand-primary/40 hover:scale-105 transition-all cursor-pointer">
                        <LogIn className="h-4 w-4 text-muted-foreground hover:text-brand-primary transition-colors" />
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{t("signIn")}</TooltipContent>
                </Tooltip>
              )
            ) : null}
          </SidebarMenuItem>
        </SidebarMenu>
      </TooltipProvider>
      <LogoutConfirmDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}
