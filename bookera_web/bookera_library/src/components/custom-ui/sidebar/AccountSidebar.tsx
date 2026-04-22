"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  User,
  Bell,
  Settings,
  BookOpen,
  DollarSign,
  Heart,
} from "lucide-react";
import BookeraLogo from "@/assets/logo/bookera-logo-hd.png";
import { useTranslations } from "next-intl";
import { SidebarUserFooter } from "@/components/custom-ui/sidebar/SidebarUserFooter";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
type NavLabelKey =
  | "profile"
  | "myBorrows"
  | "myFines"
  | "myFavorites";
const NAV_ITEMS: Array<{
  path: string;
  icon: React.ElementType;
  labelKey: NavLabelKey;
}> = [
  { path: "/profile", icon: User, labelKey: "profile" },
  { path: "/my-borrows", icon: BookOpen, labelKey: "myBorrows" },
  { path: "/my-fines", icon: DollarSign, labelKey: "myFines" },
  { path: "/favorites", icon: Heart, labelKey: "myFavorites" },
];
import AppSidebar from "./AppSidebar";

export default function AccountSidebar() {
  const t = useTranslations("sidebar");
  const tNavbar = useTranslations("navbar");
  const { open } = useSidebar();
  const pathname = usePathname();
  const userSlug = useAuthStore((state) => state.user?.slug);
  const navLabel = (key: NavLabelKey) => tNavbar(key);

  const headerContent = React.useMemo(() => (
    <>
      {open ? (
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 dark:bg-white/5 border-b border-border dark:border-white/10">
          <div className="h-1.5 w-1.5 rounded-full bg-brand-primary/60 animate-pulse" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground dark:text-white/60">
            {t("accountSettings")}
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full py-3">
          <div className="h-0.5 w-8 bg-linear-to-r from-transparent via-primary/40 to-transparent rounded-full" />
        </div>
      )}
    </>
  ), [open, t]);

  return (
    <AppSidebar subtitle={t("account")} headerContent={headerContent}>
        <SidebarGroup className="p-2">
          <TooltipProvider delayDuration={0}>
            <SidebarMenu className={cn(!open && "flex flex-col items-center")}>
              {NAV_ITEMS.map(({ path, icon: Icon, labelKey }) => {
                const href = userSlug ? `/${userSlug}${path}` : path;
                const isActive =
                  pathname === href || pathname.startsWith(`${href}/`);
                const label = navLabel(labelKey);
                return (
                  <SidebarMenuItem
                    key={href}
                    className={cn(!open && "w-full flex justify-center")}
                  >
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
                      <Link href={href}>
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
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </TooltipProvider>
        </SidebarGroup>
    </AppSidebar>
  );
}
