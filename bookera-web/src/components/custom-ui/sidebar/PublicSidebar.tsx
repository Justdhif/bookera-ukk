"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
import { useAuthStore } from "@/store/auth.store";
import SavesList from "@/components/custom-ui/content/public/SavesList";
import BookeraLogo from "@/assets/logo/bookera-logo-hd.png";
import { Home, BookOpen, DollarSign } from "lucide-react";

const mainNavItems = [
  {
    title: "Home",
    href: "/",
    icon: Home,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "My Loans",
    href: "/my-loans",
    icon: BookOpen,
    gradient: "from-orange-500 to-red-500",
  },
  {
    title: "My Fines",
    href: "/my-fines",
    icon: DollarSign,
    gradient: "from-rose-500 to-red-500",
  },
];

export default function PublicSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { open } = useSidebar();

  const handleNavClick = (href: string) => {
    if ((href === "/my-loans" || href === "/my-fines") && !isAuthenticated) {
      router.push("/login");
      return;
    }
    router.push(href);
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="border-b bg-linear-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <div className={`flex items-center gap-3 py-4 ${open ? "px-4" : "justify-center"}`}>
          <div className="relative flex h-10 w-10 items-center justify-center shrink-0">
            <Image
              src={BookeraLogo}
              alt="Bookera"
              className="h-10 w-10 object-contain brightness-0 dark:invert"
            />
          </div>
          {open && (
            <div className="flex flex-col flex-1">
              <span className="text-lg font-bold bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Bookera
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* MENU */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className={!open ? "flex flex-col items-center" : ""}>
              {mainNavItems.map((item) => {
                const isActiveItem = isActive(item.href);
                return (
                  <SidebarMenuItem
                    key={item.href}
                    className={!open ? "w-full flex justify-center" : ""}
                  >
                    <SidebarMenuButton
                      isActive={isActiveItem}
                      onClick={() => handleNavClick(item.href)}
                      tooltip={{
                        content: item.title,
                        gradient: item.gradient,
                        className: "font-medium",
                      }}
                      className={`group/item ${!open && "justify-center px-0 mx-auto"}`}
                    >
                      <div
                        className={`${
                          open ? "p-1.5" : "p-2"
                        } rounded-lg bg-linear-to-br ${item.gradient} text-white shadow-sm group-hover/item:shadow-md transition-shadow`}
                      >
                        <item.icon className="h-3.5 w-3.5" />
                      </div>
                      {open && <span className="font-medium">{item.title}</span>}
                      {isActiveItem && open && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* SavesList Section */}
        <SidebarGroup className="flex-1 mt-4">
          <div className="h-full">
            <SavesList mode="sidebar" isCollapsed={!open} />
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
