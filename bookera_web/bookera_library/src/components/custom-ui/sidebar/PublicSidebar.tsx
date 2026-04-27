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
import { MessageSquareText, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";

import AppSidebar from "./AppSidebar";

export default function PublicSidebar() {
  const { open } = useSidebar();
  const t = useTranslations("navbar");
  const tSidebar = useTranslations("sidebar");
  const pathname = usePathname();

  return (
    <AppSidebar subtitle={t("myLibrary")}>
      <div className="px-2 py-4 border-b border-border/40">
        <SidebarMenu>
          {/* Complaint Navigation */}
          <SidebarMenuItem className={cn(!open && "w-full flex justify-center")}>
            <SidebarMenuButton
              asChild
              tooltip={t("complaint")}
              className={cn(
                "rounded-xl transition-all h-10 px-3",
                !open && "justify-center px-0 mx-auto",
              )}
            >
              <Link href="/complaints">
                <div className={cn(
                  "p-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 shrink-0",
                  !open && "p-2"
                )}>
                  <MessageSquareText className="h-4 w-4" />
                </div>
                {open && <span className="font-semibold text-sm ml-1">{t("complaint")}</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Discussions Navigation */}
          <SidebarMenuItem className={cn(!open && "w-full flex justify-center")}>
            <SidebarMenuButton
              asChild
              tooltip={t("discussions")}
              className={cn(
                "rounded-xl transition-all h-10 px-3",
                !open && "justify-center px-0 mx-auto",
              )}
            >
              <Link href="/discussions">
                <div className={cn(
                  "p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 shrink-0",
                  !open && "p-2"
                )}>
                  <MessageSquare className="h-4 w-4" />
                </div>
                {open && <span className="font-semibold text-sm ml-1">{t("discussions")}</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>

      <AuthorPublisherSidebarSearch />
    </AppSidebar>
  );
}
