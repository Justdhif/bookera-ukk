"use client";
import * as React from "react";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTranslations } from "next-intl";
import BookeraLogo from "@/assets/logo/bookera-logo-hd.png";
import { SidebarUserFooter } from "@/components/custom-ui/sidebar/SidebarUserFooter";
import { useAuthStore } from "@/store/auth.store";
import { Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import AuthorPublisherSidebarSearch from "./AuthorPublisherSidebarSearch";
export default function PublicSidebar() {
  const { open } = useSidebar();
  const t = useTranslations("navbar");
  const { user } = useAuthStore();
  const pathname = usePathname();
  const isActive = pathname === "/";
  const isAdmin = user?.role === "admin" || user?.role?.startsWith("officer:");
  return (
    <Sidebar
      collapsible="icon"
      className="bg-linear-to-b from-background to-muted/20"
    >
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
      </SidebarHeader>
      <SidebarContent className="overflow-hidden flex flex-col">
        <div className="p-4 py-2 border-b border-border/40 shrink-0">
          <SidebarMenu>
            <SidebarMenuItem
              className={!open ? "w-full flex justify-center" : ""}
            >
              <SidebarMenuButton
                asChild
                tooltip={t("goToHome")}
                isActive={isActive}
                className={cn(
                  "rounded-xl transition-all",
                  isActive
                    ? "bg-brand-primary/10 dark:bg-brand-primary/15 text-brand-primary border border-brand-primary/20 dark:border-brand-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  !open && "justify-center px-0 mx-auto",
                )}
              >
                <Link href="/">
                  <Home
                    className={cn(
                      "h-5 w-5 shrink-0",
                      isActive && "text-brand-primary",
                    )}
                  />
                  {open && (
                    <span className="font-medium">
                      {t("goToHome") || "Home"}
                    </span>
                  )}
                  {isActive && open && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
        <AuthorPublisherSidebarSearch />
      </SidebarContent>
      <SidebarFooter className="p-0 border-t border-border/60 dark:border-white/10">
        <SidebarUserFooter />
      </SidebarFooter>
    </Sidebar>
  );
}
