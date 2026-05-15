"use client";

import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import NotificationDropdown from "@/components/custom-ui/navbar/NotificationDropdown";
import ChatbotHeaderTrigger from "@/components/custom-ui/navbar/ChatbotHeaderTrigger";
import HeaderMoreMenu from "@/components/custom-ui/navbar/HeaderMoreMenu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { SlideIn, StaggerContainer } from "@/components/custom-ui/motion";

export interface AppHeaderProps {
  topLeftContent?: React.ReactNode;
  topRightContent?: React.ReactNode;
  bottomLeftContent?: React.ReactNode;
  bottomRightContent?: React.ReactNode;
  isAuthenticated?: boolean;
  hideSidebarTrigger?: boolean;
}

export default function AppHeader({
  topLeftContent,
  topRightContent,
  bottomLeftContent,
  bottomRightContent,
  isAuthenticated = false,
  hideSidebarTrigger = false,
}: AppHeaderProps) {
  const t = useTranslations("navbar");
  const settingsHref = "/settings";
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md">
      <StaggerContainer
        key={pathname}
        as={motion.div}
        staggerDelay={0.08}
        delayChildren={0.04}
        className="flex w-full flex-col gap-2 px-4 py-3 md:px-6"
      >
        {(bottomLeftContent || bottomRightContent) ? (
          <div className="flex min-w-0 items-center justify-between gap-4">
            <SlideIn
              as={motion.div}
              direction="left"
              distance={12}
              duration={0.5}
              delay={0.02}
              className="min-w-0"
            >
              {bottomLeftContent}
            </SlideIn>
            <SlideIn
              as={motion.div}
              direction="right"
              distance={12}
              duration={0.5}
              delay={0.02}
              className="shrink-0"
            >
              {bottomRightContent}
            </SlideIn>
          </div>
        ) : null}

        <div className="flex min-h-12 items-center justify-between gap-4">
          <SlideIn
            as={motion.div}
            direction="left"
            distance={24}
            duration={0.6}
            delay={0.05}
            className="flex min-w-0 flex-1 items-center gap-2 md:gap-4"
          >
            {!hideSidebarTrigger ? <SidebarTrigger /> : null}
            <div className="min-w-0">{topLeftContent}</div>
          </SlideIn>

          <SlideIn
            as={motion.div}
            direction="right"
            distance={18}
            duration={0.6}
            delay={0.1}
            className="flex shrink-0 items-center gap-1.5 md:gap-3"
          >
            {topRightContent}
            {isAuthenticated ? <ChatbotHeaderTrigger /> : null}
            
            {/* Desktop Settings & Notifications */}
            <div className="hidden md:flex items-center gap-2 md:gap-3">
              {isAuthenticated ? (
                <>
                  <Link href={settingsHref} aria-label={t("goToSettings")}>
                    <Button
                      variant="outline"
                      className="text-muted-foreground hover:text-foreground flex h-9 items-center gap-2 px-3 md:h-10"
                    >
                      <Settings className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="hidden text-sm font-medium md:inline">
                        {t("settings")}
                      </span>
                    </Button>
                  </Link>
                  <NotificationDropdown isAuthenticated={isAuthenticated} />
                </>
              ) : (
                <Link href="/login">
                  <Button
                    variant="brand"
                    className="flex h-9 items-center gap-2 px-6 md:h-10 rounded-full font-bold shadow-lg shadow-brand-primary/20"
                  >
                    {t("login")}
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile More Menu */}
            <HeaderMoreMenu 
              isAuthenticated={isAuthenticated} 
              settingsHref={settingsHref} 
            />
          </SlideIn>
        </div>
      </StaggerContainer>
    </header>
  );
}
