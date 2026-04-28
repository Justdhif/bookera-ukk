"use client";


import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTranslations } from "next-intl";
import AuthorPublisherSidebarSearch from "./AuthorPublisherSidebarSearch";
import Link from "next/link";
import { Search as LucideSearch, MessageSquareText, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/auth.store";

import AppSidebar from "./AppSidebar";

export default function PublicSidebar() {
  const { open } = useSidebar();
  const t = useTranslations("navbar");
  const tSidebar = useTranslations("sidebar");
  const pathname = usePathname();
  const { user } = useAuthStore();
  const chatHref = user ? "/chat" : "/login";

  return (
    <AppSidebar subtitle={t("myLibrary")}>
      <div className="px-2 py-4 border-b border-border/40">
        <SidebarMenu>
          <SidebarMenuItem className={cn(!open && "w-full flex justify-center")}>
            <SidebarMenuButton
              asChild
              tooltip={t("explore")}
              className={cn(
                "rounded-xl transition-all h-10 px-3",
                !open && "justify-center px-0 mx-auto",
              )}
            >
              <Link href="/explore">
                <div className={cn(
                  "p-1.5 rounded-lg bg-primary/10 text-primary shrink-0",
                  !open && "p-2"
                )}>
                  <LucideSearch className="h-4 w-4" />
                </div>
                {open && <span className="font-semibold text-sm ml-1">{t("explore")}</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem className={cn(!open && "w-full flex justify-center mt-2")}>
            <SidebarMenuButton
              asChild
              tooltip="Messages"
              className={cn(
                "rounded-xl transition-all h-10 px-3",
                !open && "justify-center px-0 mx-auto",
              )}
            >
              <Link href={chatHref}>
                <div className={cn(
                  "p-1.5 rounded-lg bg-blue-500/10 text-blue-500 shrink-0",
                  !open && "p-2"
                )}>
                  <MessageSquareText className="h-4 w-4" />
                </div>
                {open && <span className="font-semibold text-sm ml-1">Messages</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>

      <AuthorPublisherSidebarSearch />
    </AppSidebar>
  );
}
