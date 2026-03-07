"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth.store";
import BookeraLogo from "@/assets/logo/bookera-logo-hd.png";
import LogoutConfirmDialog from "@/components/custom-ui/LogoutConfirmDialog";
import {
  LogOut,
  User,
  BookOpen,
  HomeIcon,
  ChevronRight,
  Activity,
  Package,
  PackageCheck,
  DollarSign,
  AlertCircle,
  Tag,
  LayoutDashboard,
  UserSquare,
  Building2,
} from "lucide-react";
const getMenuGroups = (t: any) => [
  {
    title: t("mainMenu"),
    roles: ["admin", "officer:catalog", "officer:management"],
    items: [
      {
        title: t("dashboard"),
        href: "/admin",
        icon: LayoutDashboard,
        gradient: "from-blue-500 to-cyan-500",
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
        gradient: "from-amber-500 to-orange-500",
      },
      {
        title: t("authors"),
        href: "/admin/authors",
        icon: UserSquare,
        gradient: "from-violet-500 to-purple-500",
      },
      {
        title: t("publishers"),
        href: "/admin/publishers",
        icon: Building2,
        gradient: "from-sky-500 to-blue-500",
      },
      {
        title: t("books"),
        href: "/admin/books",
        icon: BookOpen,
        gradient: "from-orange-500 to-red-500",
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
        gradient: "from-emerald-500 to-teal-500",
      },
      {
        title: t("borrows"),
        href: "/admin/borrows",
        icon: Package,
        gradient: "from-teal-500 to-cyan-500",
      },
      {
        title: t("returns"),
        href: "/admin/returns",
        icon: PackageCheck,
        gradient: "from-cyan-500 to-blue-500",
      },
      {
        title: t("fines"),
        href: "/admin/fines",
        icon: DollarSign,
        gradient: "from-rose-500 to-red-500",
      },
      {
        title: t("lostBooks"),
        href: "/admin/lost-books",
        icon: AlertCircle,
        gradient: "from-red-500 to-rose-600",
      },
      {
        title: t("activityLogs"),
        href: "/admin/activity-logs",
        icon: Activity,
        gradient: "from-purple-500 to-pink-500",
      },
    ],
  },
];

export function AdminSidebar() {
  const t = useTranslations("sidebar");
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, initialLoading } = useAuthStore();
  const { open } = useSidebar();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = React.useState(false);
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

  const handleLogout = () => {
    setIsLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = async () => {
    logout();
    router.push("/");
  };

  return (
    <Sidebar collapsible="icon" variant="floating" className="p-4">
      <SidebarHeader className="border-b bg-linear-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
        <div
          className={`flex items-center gap-3 py-4 ${open ? "px-4" : "justify-center"}`}
        >
          <div className="relative flex h-12 w-12 items-center justify-center shrink-0">
            <Image
              src={BookeraLogo}
              alt="Bookera"
              className="w-full h-full object-contain brightness-0 dark:invert"
            />
          </div>
          {open && (
            <div className="flex flex-col flex-1 gap-0.5">
              <span className="text-lg font-bold bg-linear-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                Bookera
              </span>
              <span className="text-xs text-muted-foreground">
                {roleDisplay}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className={!open ? "flex flex-col items-center" : ""}>
              {menuGroups.map((group, groupIndex) => (
                <React.Fragment key={group.title}>
                  {open ? (
                    <div className="px-3 pt-4 pb-2">
                      <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                        {group.title}
                      </p>
                    </div>
                  ) : (
                    groupIndex > 0 && (
                      <div className="flex items-center justify-center w-full py-3">
                        <div
                          className={`h-0.5 w-8 bg-linear-to-r from-transparent ${
                            groupIndex === 1
                              ? "via-amber-500/40"
                              : groupIndex === 2
                                ? "via-emerald-500/40"
                                : "via-primary/40"
                          } to-transparent rounded-full`}
                        />
                      </div>
                    )
                  )}

                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <SidebarMenuItem
                        key={item.href}
                        className={!open ? "w-full flex justify-center" : ""}
                      >
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={{
                            content: item.title,
                            gradient: item.gradient,
                            className: "font-medium",
                          }}
                          className={`group/item ${!open && "justify-center px-0 mx-auto"}`}
                        >
                          <Link href={item.href}>
                            <div
                              className={`${
                                open ? "p-1.5" : "p-2"
                              } rounded-lg bg-linear-to-br ${item.gradient} text-white shadow-sm group-hover/item:shadow-md transition-shadow`}
                            >
                              <item.icon className="h-3.5 w-3.5" />
                            </div>
                            {open && (
                              <span className="font-medium">{item.title}</span>
                            )}
                            {isActive && open && (
                              <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
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

      <SidebarFooter className="border-t bg-linear-to-br from-slate-50/50 to-gray-50/50 dark:from-slate-950/20 dark:to-gray-950/20">
        <SidebarMenu className={!open ? "flex flex-col items-center" : ""}>
          <SidebarMenuItem
            className={!open ? "w-full flex justify-center" : ""}
          >
            <SidebarMenuButton
              asChild
              isActive={pathname === "/"}
              tooltip={{
                content: t("publicPage"),
                gradient: "from-blue-600 to-indigo-600",
                className: "font-medium",
              }}
              className={`group/home ${!open && "justify-center px-0 mx-auto"}`}
            >
              <Link href="/">
                <div
                  className={`${
                    open ? "p-1.5" : "p-2"
                  } rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-sm group-hover/home:shadow-md transition-shadow`}
                >
                  <HomeIcon className="h-3.5 w-3.5" />
                </div>
                {open && <span className="font-medium">{t("publicPage")}</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem
            className={!open ? "w-full flex justify-center" : ""}
          >
            <SidebarMenuButton
              onClick={handleLogout}
              className={`group/logout hover:bg-linear-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-950/20 dark:hover:to-rose-950/20 transition-all ${
                !open && "justify-center px-0 mx-auto"
              }`}
              tooltip={{
                content: t("logout"),
                gradient: "from-red-600 to-rose-600",
                className: "font-medium",
              }}
            >
              <div
                className={`${
                  open ? "p-1.5" : "p-2"
                } rounded-lg bg-linear-to-br from-red-500 to-rose-500 text-white shadow-sm group-hover/logout:shadow-md group-hover/logout:scale-105 transition-all`}
              >
                <LogOut className="h-3.5 w-3.5" />
              </div>
              {open && (
                <span className="font-medium text-red-600 dark:text-red-400">
                  {t("logout")}
                </span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            {initialLoading ? (
              <div
                className={`h-auto py-3 px-2 ${!open && "flex justify-center"}`}
              >
                <div
                  className={`flex items-center w-full ${open ? "gap-3" : "justify-center"}`}
                >
                  <div className="relative shrink-0">
                    <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                  </div>

                  {open && (
                    <div className="flex flex-col items-start flex-1 min-w-0 gap-1.5">
                      <div className="h-3.5 bg-muted rounded w-24 animate-pulse" />

                      <div className="h-3 bg-muted rounded w-32 animate-pulse" />

                      <div className="h-2.5 bg-muted rounded w-16 animate-pulse mt-0.5" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <SidebarMenuButton
                asChild
                className={`h-auto py-3 hover:bg-linear-to-r hover:from-emerald-50/50 hover:to-teal-50/50 dark:hover:from-emerald-950/20 dark:hover:to-teal-950/20 transition-all group/profile rounded-xl ${
                  !open && "justify-center"
                }`}
                tooltip={{
                  content: user?.profile?.full_name || user?.email || "Profile",
                  gradient: "from-emerald-600 to-teal-600",
                  className: "font-medium truncate max-w-[200px]",
                }}
              >
                <Link href="/admin/profile">
                  <div
                    className={`flex items-center w-full ${open ? "gap-3" : "justify-center"}`}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-9 w-9 ring-2 ring-emerald-200/50 dark:ring-emerald-800/50 group-hover/profile:ring-emerald-400/70 dark:group-hover/profile:ring-emerald-600/70 transition-all group-hover/profile:scale-105 shadow-md">
                        <AvatarImage
                          src={user?.profile?.avatar}
                          alt={
                            user?.profile?.full_name || user?.email || "User"
                          }
                        />
                        <AvatarFallback className="bg-linear-to-br from-emerald-500 to-teal-500 text-white font-semibold">
                          {user?.profile?.full_name?.[0]?.toUpperCase() ||
                            user?.email?.[0]?.toUpperCase() ||
                            "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-linear-to-br from-green-400 to-emerald-500 border-2 border-background shadow-sm animate-pulse" />
                    </div>
                    {open && (
                      <>
                        <div className="flex flex-col items-start flex-1 min-w-0">
                          <span className="text-sm font-semibold truncate w-full group-hover/profile:text-emerald-700 dark:group-hover/profile:text-emerald-400 transition-colors">
                            {user?.profile?.full_name || user?.email}
                          </span>
                          <span className="text-xs text-muted-foreground truncate w-full">
                            {user?.email}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover/profile:text-emerald-600 dark:group-hover/profile:text-emerald-400 group-hover/profile:translate-x-1 transition-all shrink-0" />
                      </>
                    )}
                  </div>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <LogoutConfirmDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        onConfirm={handleLogoutConfirm}
      />
    </Sidebar>
  );
}
