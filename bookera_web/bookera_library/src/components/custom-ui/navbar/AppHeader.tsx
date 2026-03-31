"use client";
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import NotificationDropdown from "@/components/custom-ui/navbar/NotificationDropdown";
import Link from "next/link";
export interface AppHeaderProps {
  leftContent?: React.ReactNode;
  isAuthenticated?: boolean;
  hideSidebarTrigger?: boolean;
}
export default function AppHeader({
  leftContent,
  isAuthenticated = true,
  hideSidebarTrigger = false,
}: AppHeaderProps) {
  const t = useTranslations("navbar");
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b flex h-16 md:h-18 lg:h-20 items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-2 md:gap-4 flex-1">
        {!hideSidebarTrigger ? <SidebarTrigger /> : null}
        {leftContent}
      </div>
      <div className="flex items-center gap-1.5 md:gap-3">
        <Link href="/settings">
          <Button
            variant="outline"
            className="text-muted-foreground hover:text-foreground px-3 flex items-center gap-2 h-9 md:h-10"
            aria-label={t("goToSettings")}
          >
            <Settings className="h-4 w-4 md:h-5 md:w-5" />
            <span className="hidden md:inline font-medium text-sm">
              {t("settings")}
            </span>
          </Button>
        </Link>
        <NotificationDropdown isAuthenticated={isAuthenticated} />
      </div>
    </header>
  );
}
