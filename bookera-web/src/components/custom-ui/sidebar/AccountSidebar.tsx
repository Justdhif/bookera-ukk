"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import {
  User,
  Bell,
  Settings,
  BookOpen,
  DollarSign,
  MessageSquare,
} from "lucide-react";
import BookeraLogo from "@/assets/logo/bookera-logo-hd.png";
import { useTranslations } from "next-intl";
import { SidebarUserFooter } from "@/components/custom-ui/sidebar/SidebarUserFooter";
import { cn } from "@/lib/utils";

type NavLabelKey =
  | "profile"
  | "settings"
  | "notifications"
  | "myBorrows"
  | "myFines"
  | "myPosts";

const NAV_ITEMS: Array<{
  href: string;
  icon: React.ElementType;
  labelKey: NavLabelKey;
}> = [
  { href: "/profile", icon: User, labelKey: "profile" },
  { href: "/my-borrows", icon: BookOpen, labelKey: "myBorrows" },
  { href: "/my-fines", icon: DollarSign, labelKey: "myFines" },
  { href: "/my-posts", icon: MessageSquare, labelKey: "myPosts" },
  { href: "/settings", icon: Settings, labelKey: "settings" },
  { href: "/notifications", icon: Bell, labelKey: "notifications" },
];

export default function AccountSidebar() {
  const t = useTranslations("sidebar");
  const tNavbar = useTranslations("navbar");
  const { open } = useSidebar();
  const pathname = usePathname();

  const navLabel = (key: NavLabelKey) => tNavbar(key);

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
                  {t("account")}
                </span>
              </div>
            )}
          </div>

          <div className="mt-2 h-px bg-linear-to-r from-white/0 via-white/30 to-white/0" />
        </div>

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
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">
        <SidebarGroup className="p-2">
          <TooltipProvider delayDuration={0}>
            <SidebarMenu className={cn(!open && "flex flex-col items-center")}>
              {NAV_ITEMS.map(({ href, icon: Icon, labelKey }) => {
                const isActive = pathname === href;
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
      </SidebarContent>

      <SidebarFooter className="p-0 border-t border-border/60 dark:border-white/10">
        <SidebarUserFooter t={t} />
      </SidebarFooter>
    </Sidebar>
  );
}
