"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/auth.store";
import { motion } from "framer-motion";
import BookeraLogo from "@/assets/logo/bookera-logo-hd.png";
import {
  BookOpen,
  Activity,
  Package,
  PackageCheck,
  DollarSign,
  AlertCircle,
  Tag,
  Bookmark,
  LayoutDashboard,
  UserSquare,
  Building2,
  User,
  FileText,
  Shield,
  Newspaper,
  Percent,
  Key,
} from "lucide-react";
import { SidebarUserFooter } from "@/components/custom-ui/sidebar/SidebarUserFooter";
import { cn } from "@/lib/utils";
import { StaggerContainer, SlideIn } from "@/components/custom-ui/motion";

type MenuItem = {
  title: string;
  href: string;
  icon: any;
  roles?: string[];
};
type MenuGroup = {
  title: string;
  roles: string[];
  items: MenuItem[];
};
const getMenuGroups = (t: any, role: string | undefined): MenuGroup[] => [
  {
    title: t("mainMenu"),
    roles: ["admin", "officer:catalog", "officer:management"],
    items: [
      {
        title: t("dashboard"),
        href:
          role === "officer:catalog"
            ? "/admin/categories"
            : role === "officer:management"
              ? "/admin/users"
              : "/admin",
        icon: LayoutDashboard,
      },
      {
        title: t("news"),
        href: "/admin/news",
        icon: Newspaper,
      },
    ],
  },
  {
    title: t("catalog"),
    roles: ["admin", "officer:catalog"],
    items: [
      {
        title: t("categories"),
        href: "/admin/categories",
        icon: Tag,
      },
      {
        title: t("genres"),
        href: "/admin/genres",
        icon: Bookmark,
      },
      {
        title: t("authors"),
        href: "/admin/authors",
        icon: UserSquare,
      },
      {
        title: t("publishers"),
        href: "/admin/publishers",
        icon: Building2,
      },
      {
        title: t("books"),
        href: "/admin/books",
        icon: BookOpen,
      },
    ],
  },
  {
    title: t("management"),
    roles: ["admin", "officer:management"],
    items: [
      {
        title: t("users"),
        href: "/admin/users",
        icon: User,
      },
      {
        title: t("borrows"),
        href: "/admin/borrows",
        icon: Package,
      },
      {
        title: t("returns"),
        href: "/admin/returns",
        icon: PackageCheck,
      },
      {
        title: t("fines"),
        href: "/admin/fines",
        icon: DollarSign,
      },
      {
        title: t("lostBooks"),
        href: "/admin/lost-books",
        icon: AlertCircle,
      },
    ],
  },
  {
    title: t("promotions"),
    roles: ["admin"],
    items: [
      {
        title: t("membershipDiscounts"),
        href: "/admin/membership-discounts",
        icon: Percent,
      },
      {
        title: t("discountKeys"),
        href: "/admin/discount-keys",
        icon: Key,
      },
    ],
  },
  {
    title: t("systemSettings"),
    roles: ["admin"],
    items: [
      {
        title: t("activityLogs"),
        href: "/admin/activity-logs",
        icon: Activity,
      },
      {
        title: t("termsOfService"),
        href: "/admin/terms-of-service",
        icon: FileText,
      },
      {
        title: t("privacyPolicy"),
        href: "/admin/privacy-policy",
        icon: Shield,
      },
    ],
  },
];

import AppSidebar from "./AppSidebar";

export function AdminSidebar() {
  const t = useTranslations("sidebar");
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { open } = useSidebar();
  const allMenuGroups = getMenuGroups(t, user?.role);
  const menuGroups = React.useMemo(() => {
    if (!user?.role) return [];
    return allMenuGroups.filter((group) => group.roles.includes(user.role));
  }, [user?.role, allMenuGroups]);
  const roleDisplay = React.useMemo(() => {
    if (!user?.role) return "";
    if (user.role.startsWith("officer:")) {
      const [role, type] = user.role.split(":");
      return `${role} • ${type}`;
    }
    return user.role;
  }, [user?.role]);
  return (
    <AppSidebar subtitle={roleDisplay}>
      <SidebarGroup>
        <SidebarGroupContent>
          <StaggerContainer
            as={motion.ul}
            staggerDelay={0.05}
            data-slot="sidebar-menu"
            data-sidebar="menu"
            className={cn(
              "flex w-full min-w-0 flex-col gap-1",
              !open ? "items-center" : "",
            )}
          >
            {menuGroups.map((group, groupIndex) => (
              <React.Fragment key={group.title}>
                {open ? (
                  <SlideIn direction="left" delay={groupIndex * 0.1}>
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 dark:bg-white/5 border-b border-border dark:border-white/10 mt-2 first:mt-0">
                      <div className="h-1.5 w-1.5 rounded-full bg-brand-primary/60 animate-pulse" />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground dark:text-white/60">
                        {group.title}
                      </span>
                    </div>
                  </SlideIn>
                ) : (
                  groupIndex > 0 && (
                    <div className="flex items-center justify-center w-full py-3">
                      <div className="h-0.5 w-8 bg-linear-to-r from-transparent via-primary/40 to-transparent rounded-full" />
                    </div>
                  )
                )}
                {group.items.map((item, itemIndex) => {
                  if (
                    item.roles &&
                    user?.role &&
                    !item.roles.includes(user.role)
                  ) {
                    return null;
                  }
                  const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
                  return (
                    <SlideIn
                      key={item.href}
                      as={motion.li}
                      direction="left"
                      delay={(groupIndex + itemIndex) * 0.05}
                      data-slot="sidebar-menu-item"
                      data-sidebar="menu-item"
                      className={cn(
                        "group/menu-item relative",
                        !open ? "w-full flex justify-center" : "",
                      )}
                    >
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={{ content: item.title }}
                        className={cn(
                          "rounded-xl transition-all h-10 px-3",
                          isActive
                            ? "bg-brand-primary/10 dark:bg-brand-primary/15 text-brand-primary border border-brand-primary/20 dark:border-brand-primary/30"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent",
                          !open && "justify-center px-0 mx-auto",
                        )}
                      >
                        <Link href={item.href}>
                          <item.icon
                            className={cn(
                              "h-5 w-5 shrink-0",
                              isActive && "text-brand-primary",
                            )}
                          />
                          {open && (
                            <span className="font-medium">{item.title}</span>
                          )}
                          {isActive && open && (
                            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SlideIn>
                  );
                })}
              </React.Fragment>
            ))}
          </StaggerContainer>
        </SidebarGroupContent>
      </SidebarGroup>
    </AppSidebar>
  );
}
