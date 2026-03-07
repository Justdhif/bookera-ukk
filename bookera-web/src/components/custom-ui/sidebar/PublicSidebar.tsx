"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BookOpen, ChevronRight, Layers, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import BookeraLogo from "@/assets/logo/bookera-logo-hd.png";
import SavesList from "@/components/custom-ui/content/public/saves/SavesList";
import FollowsList from "@/components/custom-ui/content/public/follows/FollowsList";

export default function PublicSidebar() {
  const { open } = useSidebar();
  const t = useTranslations("navbar");

  return (
    <Sidebar collapsible="icon" className="bg-linear-to-b from-background to-muted/20">
      <SidebarHeader className="p-0 overflow-hidden border-b-0">
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
                  {t("myLibrary")}
                </span>
              </div>
            )}
          </div>

          <div className="mt-2 h-px bg-linear-to-r from-white/0 via-white/30 to-white/0" />
        </div>

        {open && (
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 dark:bg-white/5 border-b border-border dark:border-white/10">
            <div className="h-1.5 w-1.5 rounded-full bg-brand-primary/60 animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground dark:text-white/60">
              {t("collections")}
            </span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">
        <SidebarGroup className="p-0 flex-none">
          <SavesList mode="sidebar" isCollapsed={!open} />
        </SidebarGroup>

        {open && (
          <div className="mx-4 h-px bg-border/60 dark:bg-white/10" />
        )}

        <SidebarGroup className="p-0 flex-none">
          <FollowsList isCollapsed={!open} />
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-0 border-t border-border/60 dark:border-white/10">
        <TooltipProvider>
          {open ? (
            <div className="px-3 py-3 space-y-2">
              <Link href="/books">
                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 bg-brand-primary/8 hover:bg-brand-primary/15 dark:bg-brand-primary/10 dark:hover:bg-brand-primary/20 border border-brand-primary/15 hover:border-brand-primary/30 transition-all cursor-pointer group">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-primary/15 group-hover:bg-brand-primary/25 transition-colors shrink-0">
                    <BookOpen className="h-3.5 w-3.5 text-brand-primary" />
                  </div>
                  <span className="text-xs font-semibold text-brand-primary flex-1">{t("browseAllBooks")}</span>
                  <ChevronRight className="h-3 w-3 text-brand-primary/50 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>

              <div className="flex items-center gap-2 px-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-2.5 w-2.5 text-brand-primary/50" />
                  <span className="text-[10px] font-medium text-muted-foreground/60">Bookera Library</span>
                </div>
                <div className="flex-1 h-px bg-border/50" />
                <div className="flex items-center gap-1">
                  <Layers className="h-2.5 w-2.5 text-muted-foreground/40" />
                  <span className="text-[10px] text-muted-foreground/40">v1.0</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-3 gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/books">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/15 hover:border-brand-primary/30 transition-all cursor-pointer">
                      <BookOpen className="h-4 w-4 text-brand-primary" />
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{t("browseAllBooks")}</TooltipContent>
              </Tooltip>

              <div className="h-px w-6 bg-border/50" />

              <div className="flex h-5 w-5 items-center justify-center">
                <Sparkles className="h-3 w-3 text-brand-primary/30" />
              </div>
            </div>
          )}
        </TooltipProvider>
      </SidebarFooter>
    </Sidebar>
  );
}
