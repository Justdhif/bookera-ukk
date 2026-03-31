"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/auth.store";
import BookeraLogo from "@/assets/logo/bookera-logo-hd.png";
import {
  BookOpen,
  Activity,
  Package,
  PackageCheck,
  DollarSign,
  AlertCircle,
  Tag,
  LayoutDashboard,
  UserSquare,
  Building2,
  User,
  FileText,
  Shield,
} from "lucide-react";
import { SidebarUserFooter } from "@/components/custom-ui/sidebar/SidebarUserFooter";
import { cn } from "@/lib/utils";
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
const getMenuGroups = (t: any): MenuGroup[] => [
  {
    title: t("mainMenu"),
    roles: ["admin", "officer:catalog", "officer:management"],
    items: [
      {
        title: t("dashboard"),
        href: "/admin",
        icon: LayoutDashboard,
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
      {
        title: t("activityLogs"),
        href: "/admin/activity-logs",
        icon: Activity,
      },
    ],
  },
  {
    title: t("systemSettings"),
    roles: ["admin"],
    items: [
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
export function AdminSidebar() {
  const t = useTranslations("sidebar");
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { open } = useSidebar();
  const allMenuGroups = getMenuGroups(t);
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
    <Sidebar
      collapsible="icon"
      className="bg-linear-to-b from-background to-muted/20"
    >
      <SidebarHeader className="relative p-0 border-b-0">
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
                  {roleDisplay}
                </span>
              </div>
            )}
          </div>
          <div className="mt-2 h-px bg-linear-to-r from-white/0 via-white/30 to-white/0" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className={!open ? "flex flex-col items-center" : ""}>
              {menuGroups.map((group, groupIndex) => (
                <React.Fragment key={group.title}>
                  {open ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 dark:bg-white/5 border-b border-border dark:border-white/10">
                      <div className="h-1.5 w-1.5 rounded-full bg-brand-primary/60 animate-pulse" />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground dark:text-white/60">
                        {group.title}
                      </span>
                    </div>
                  ) : (
                    groupIndex > 0 && (
                      <div className="flex items-center justify-center w-full py-3">
                        <div className="h-0.5 w-8 bg-linear-to-r from-transparent via-primary/40 to-transparent rounded-full" />
                      </div>
                    )
                  )}
                  {group.items.map((item) => {
                    if (
                      item.roles &&
                      user?.role &&
                      !item.roles.includes(user.role)
                    ) {
                      return null;
                    }
                    const isActive = pathname === item.href;
                    return (
                      <SidebarMenuItem
                        key={item.href}
                        className={!open ? "w-full flex justify-center" : ""}
                      >
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={{ content: item.title }}
                          className={cn(
                            "rounded-xl transition-all",
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
                      </SidebarMenuItem>
                    );
                  })}
                </React.Fragment>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-0 border-t border-border/60 dark:border-white/10">
        <SidebarUserFooter />
      </SidebarFooter>
    </Sidebar>
  );
}
