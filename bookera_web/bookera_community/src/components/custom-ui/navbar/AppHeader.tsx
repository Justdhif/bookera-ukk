"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import NotificationDropdown from "@/components/custom-ui/navbar/NotificationDropdown";
import BookeraLogo from "@/assets/logo/bookera-logo-hd.png";

export interface AppHeaderProps {
  /** Items to display on the left next to the Sidebar Trigger (e.g. Breadcrumbs, Search, Home Button) */
  leftContent?: React.ReactNode;
  /** Whether the user is authenticated (passed to Notifications) */
  isAuthenticated?: boolean;
  /** True if the sidebar trigger should be completely omitted from the layout */
  hideSidebarTrigger?: boolean;
}

export default function AppHeader({
  leftContent,
  isAuthenticated = true,
  hideSidebarTrigger = false,
}: AppHeaderProps) {
  const t = useTranslations("navbar");
  const pathname = usePathname();
  const isDiscussionHeader = pathname?.startsWith("/discussion") ?? false;

  return (
    <header
      className={`sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b flex h-16 md:h-18 lg:h-20 items-center justify-between px-4 md:px-6 ${
        isDiscussionHeader ? "md:hidden" : ""
      }`}
    >
      <div className="flex items-center gap-2 md:gap-4 flex-1">
        {isDiscussionHeader ? (
          <Link href="/discussion" className="flex items-center gap-2.5">
            <Image
              src={BookeraLogo}
              alt="Bookera"
              width={36}
              height={36}
              className="h-9 w-9"
              priority={false}
            />
            <span className="font-bold text-lg text-foreground">Bookera</span>
          </Link>
        ) : !hideSidebarTrigger ? (
          <SidebarTrigger />
        ) : null}
        {leftContent}
      </div>

      <div className="flex items-center gap-1.5 md:gap-3">
        <Link href="/settings">
          <Button
            variant="outline"
            className="text-muted-foreground hover:text-foreground px-3 flex items-center gap-2"
            aria-label={t("goToSettings")}
          >
            <Settings className="h-4 w-4 md:h-5 md:w-5" />
            <span className="hidden md:inline font-medium text-sm">{t("settings")}</span>
          </Button>
        </Link>

        <NotificationDropdown isAuthenticated={isAuthenticated} />
      </div>
    </header>
  );
}
