"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Compass, Home, PlusSquare, User } from "lucide-react";

import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth.store";
import CreatePostModal from "@/components/custom-ui/content/discussion/CreatePostModal";
import { DiscussionPost } from "@/types/discussion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function DiscussionBottomBar() {
  const t = useTranslations("discussion");
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const [showCreateModal, setShowCreateModal] = React.useState(false);

  const handlePostCreated = (_newPost: DiscussionPost) => {
    setShowCreateModal(false);
    toast.success(t("postCreatedSuccess"));

    if (pathname === "/discussion") {
      router.refresh();
    } else {
      router.push("/discussion");
    }
  };

  const avatarSrc = user?.profile?.avatar_url
    ? user.profile.avatar_url
    : user?.profile?.avatar
      ? user.profile.avatar.startsWith("http")
        ? user.profile.avatar
        : `${process.env.NEXT_PUBLIC_STORAGE_URL}/${user.profile.avatar}`
      : undefined;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-around px-2 py-2">
          {/** Match SidebarMenuButton active styling */}
          <Link
            href="/discussion"
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-xl transition-all",
              pathname === "/discussion"
                ? "bg-brand-primary/10 dark:bg-brand-primary/15 text-brand-primary border border-brand-primary/20 dark:border-brand-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
            aria-label={t("navHome")}
            aria-current={pathname === "/discussion" ? "page" : undefined}
          >
            <Home
              className={cn(
                "h-5 w-5 shrink-0",
                pathname === "/discussion" && "text-brand-primary",
              )}
            />
            <span>{t("navHome")}</span>
          </Link>

          <Link
            href="/discussion/explore"
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-xl transition-all",
              pathname.startsWith("/discussion/explore")
                ? "bg-brand-primary/10 dark:bg-brand-primary/15 text-brand-primary border border-brand-primary/20 dark:border-brand-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
            aria-label={t("navExplore")}
            aria-current={pathname.startsWith("/discussion/explore") ? "page" : undefined}
          >
            <Compass
              className={cn(
                "h-5 w-5 shrink-0",
                pathname.startsWith("/discussion/explore") && "text-brand-primary",
              )}
            />
            <span>{t("navExplore")}</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated) {
                router.push("/login");
                return;
              }
              setShowCreateModal(true);
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-xl transition-all",
              "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
            aria-label={t("navCreate")}
          >
            <PlusSquare className="h-5 w-5 shrink-0" />
            <span>{t("navCreate")}</span>
          </button>

          {isAuthenticated ? (
            <Link
              href="/profile"
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-xl transition-all",
                "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
              aria-label={t("navProfile")}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={avatarSrc}
                  alt={user?.profile?.full_name || user?.email || "User"}
                />
                <AvatarFallback className="text-[10px] font-semibold">
                  {user?.profile?.full_name?.[0]?.toUpperCase() ||
                    user?.email?.[0]?.toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <span>{t("navProfile")}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/login")}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-xl transition-all",
                "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
              aria-label={t("navProfile")}
            >
              <User className="h-5 w-5 shrink-0" />
              <span>{t("navProfile")}</span>
            </button>
          )}
        </div>
      </nav>

      {showCreateModal && isAuthenticated && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handlePostCreated}
        />
      )}
    </>
  );
}
