"use client";

import { useState, useEffect, useCallback } from "react";
import { chatService } from "@/services/chat.service";
import { echo } from "@/lib/echo";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTranslations } from "next-intl";
import AuthorPublisherSidebarSearch from "./AuthorPublisherSidebarSearch";
import Link from "next/link";
import {
  Search as LucideSearch,
  MessageSquareText,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/auth.store";
import { StaggerContainer, SlideIn } from "@/components/custom-ui/motion";
import { motion } from "framer-motion";
import AppSidebar from "./AppSidebar";

export default function PublicSidebar() {
  const { open } = useSidebar();
  const t = useTranslations("navbar");
  const tSidebar = useTranslations("sidebar");
  const pathname = usePathname();
  const { user } = useAuthStore();
  const chatHref = user ? "/chat" : "/login";

  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(() => {
    if (!user) return;
    chatService
      .getConversations()
      .then((conversations) => {
        const count = conversations.reduce(
          (acc, conv) => acc + conv.unread_count,
          0,
        );
        setUnreadCount(count);
      })
      .catch((err) =>
        console.error("Failed to fetch unread messages count", err),
      );
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();

      if (echo) {
        const channel = echo.private(`chat.${user.id}`);

        const handleNewMessage = () => {
          fetchUnreadCount();
        };

        channel.listen(".message.sent", handleNewMessage);
        channel.listen(".messages.read", handleNewMessage);

        return () => {
          channel.stopListening(".message.sent", handleNewMessage);
          channel.stopListening(".messages.read", handleNewMessage);
        };
      }
    } else {
      setUnreadCount(0);
    }
  }, [user, fetchUnreadCount]);

  useEffect(() => {
    if (user && pathname.startsWith("/chat")) {
      fetchUnreadCount();
    }
  }, [pathname, user, fetchUnreadCount]);

  const displayUnread = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <AppSidebar subtitle={t("myLibrary")}>
      <div className="px-2 py-4 border-b border-border/40">
        <SidebarMenu>
          <StaggerContainer
            as={motion.div}
            staggerDelay={0.05}
            className="flex flex-col gap-1"
          >
            <SlideIn direction="left" delay={0.1}>
              <SidebarMenuItem
                className={cn(!open && "w-full flex justify-center")}
              >
                <SidebarMenuButton
                  asChild
                  tooltip={t("explore")}
                  className={cn(
                    "rounded-xl transition-all h-10 px-3",
                    !open && "justify-center px-0 mx-auto",
                  )}
                >
                  <Link href="/explore">
                    <div
                      className={cn(
                        "p-1.5 rounded-lg bg-primary/10 text-primary shrink-0",
                        !open && "p-2",
                      )}
                    >
                      <LucideSearch className="h-4 w-4" />
                    </div>
                    {open && (
                      <span className="font-semibold text-sm ml-1">
                        {t("explore")}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SlideIn>

            {user?.role !== "user" && (
              <SlideIn direction="left" delay={0.15}>
                <SidebarMenuItem
                  className={cn(!open && "w-full flex justify-center mt-2")}
                >
                  <SidebarMenuButton
                    asChild
                    tooltip="Messages"
                    className={cn(
                      "rounded-xl transition-all h-10 px-3",
                      !open && "justify-center px-0 mx-auto",
                    )}
                  >
                    <Link href={chatHref}>
                      <div
                        className={cn(
                          "p-1.5 rounded-lg bg-blue-500/10 text-blue-500 shrink-0 relative",
                          !open && "p-2",
                        )}
                      >
                        <MessageSquareText className="h-4 w-4" />
                        {!open && user && unreadCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full h-4.5 min-w-4.5 px-1 flex items-center justify-center border-2 border-background shadow-sm">
                            {displayUnread}
                          </span>
                        )}
                      </div>
                      {open && (
                        <div className="flex items-center justify-between flex-1 ml-1">
                          <span className="font-semibold text-sm">
                            Messages
                          </span>
                          {user && unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold rounded-full h-5 px-1.5 min-w-5 flex items-center justify-center shrink-0 ml-2 shadow-sm">
                              {displayUnread}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SlideIn>
            )}
          </StaggerContainer>
        </SidebarMenu>
      </div>

      <AuthorPublisherSidebarSearch />
    </AppSidebar>
  );
}
