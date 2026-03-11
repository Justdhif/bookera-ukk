"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Home, PlusSquare, Search, Bell, Settings } from "lucide-react";
import BookeraLogo from "@/assets/logo/bookera-logo-hd.png";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { SidebarUserFooter } from "@/components/custom-ui/sidebar/SidebarUserFooter";
import CreatePostModal from "@/components/custom-ui/content/discussion/CreatePostModal";
import { DiscussionPost } from "@/types/discussion";
import { toast } from "sonner";

type NavItem =
  | {
      href: string;
      icon: React.ElementType;
      label: string;
      exact: boolean;
      isCreate?: false;
    }
  | {
      href: null;
      icon: React.ElementType;
      label: string;
      isCreate: true;
    };

export default function DiscussionSidebar() {
  const t = useTranslations("discussion");
  const { open } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handlePostCreated = (_newPost: DiscussionPost) => {
    setShowCreateModal(false);
    toast.success(t("postCreatedSuccess"));
    if (pathname === "/discussion") {
      router.refresh();
    } else {
      router.push("/discussion");
    }
  };

  const NAV_ITEMS: NavItem[] = [
    { href: "/discussion", icon: Home, label: t("navHome"), exact: true },
    {
      href: null,
      icon: PlusSquare,
      label: t("navCreate"),
      isCreate: true,
    },
    {
      href: "/discussion/search",
      icon: Search,
      label: t("navSearch"),
      exact: false,
    },
    {
      href: "/notifications",
      icon: Bell,
      label: t("navNotifications"),
      exact: false,
    },
    {
      href: "/settings",
      icon: Settings,
      label: t("navSettings"),
      exact: false,
    },
  ];

  return (
    <>
    <Sidebar
      collapsible="icon"
      className="bg-linear-to-b from-background to-muted/20"
    >
      <SidebarHeader className="relative p-0 border-b-0">
        <div className="relative bg-linear-to-135deg from-brand-primary-dark via-brand-primary to-brand-primary-light overflow-hidden">
          <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-primary/8" />
          <div className="absolute -bottom-4 -left-4 h-14 w-14 rounded-full bg-primary/8" />

          <div
            className={`relative z-10 flex items-center gap-3 px-4 py-4 ${
              !open ? "justify-center px-0" : ""
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary shadow-md backdrop-blur-sm ring-1 ring-brand-primary/20">
              <Image
                src={BookeraLogo}
                alt="Bookera"
                className="h-6 w-6 object-contain brightness-0 invert"
              />
            </div>

            {open && (
              <div className="flex flex-col leading-tight">
                <span className="text-[15px] font-bold tracking-wide text-brand-primary drop-shadow-sm">
                  Bookera
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {t("communityLabel")}
                </span>
              </div>
            )}
          </div>

          <div className="mt-2 h-px bg-linear-to-r from-white/0 via-white/30 to-white/0" />
        </div>
      </SidebarHeader>

      {open ? (
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 dark:bg-white/5 border-b border-border dark:border-white/10">
          <div className="h-1.5 w-1.5 rounded-full bg-brand-primary/60 animate-pulse" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground dark:text-white/60">
            {t("community")}
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full py-3">
          <div className="h-0.5 w-8 bg-linear-to-r from-transparent via-primary/40 to-transparent rounded-full" />
        </div>
      )}

      <SidebarContent className="overflow-y-auto">
        <SidebarGroup className="p-2">
          <TooltipProvider delayDuration={0}>
            <SidebarMenu className={cn(!open && "flex flex-col items-center")}>
              {NAV_ITEMS.map((item) => {
                const { icon: Icon, label } = item;
                const isActive = item.isCreate
                    ? false
                    : item.href === "/discussion"
                      ? pathname === "/discussion"
                      : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem
                    key={label}
                    className={cn(!open && "w-full flex justify-center")}
                  >
                    {item.isCreate ? (
                      <SidebarMenuButton
                        onClick={() => setShowCreateModal(true)}
                        isActive={false}
                        tooltip={{ content: label }}
                        className={cn(
                          "rounded-xl transition-all cursor-pointer",
                          "text-muted-foreground hover:text-foreground hover:bg-accent",
                          !open && "justify-center px-0 mx-auto",
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {open && <span className="font-medium">{label}</span>}
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={{ content: label }}
                        className={cn(
                          "rounded-xl transition-all",
                          isActive
                            ? "bg-brand-primary/10 dark:bg-brand-primary/15 text-brand-primary border border-brand-primary/20 dark:border-brand-primary/30"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent",
                          !open && "justify-center px-0 mx-auto",
                        )}
                      >
                        <Link href={item.href}>
                          <Icon
                            className={cn(
                              "h-5 w-5 shrink-0",
                              isActive && "text-brand-primary",
                            )}
                          />
                          {open && <span className="font-medium">{label}</span>}
                          {isActive && open && (
                            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </TooltipProvider>
        </SidebarGroup>


      </SidebarContent>

      <SidebarFooter className="p-0 border-t border-border/60 dark:border-white/10">
        <SidebarUserFooter t={t} />
      </SidebarFooter>
    </Sidebar>

    {showCreateModal && (
      <CreatePostModal
        onClose={() => setShowCreateModal(false)}
        onCreated={handlePostCreated}
      />
    )}
    </>
  );
}
