"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";

const menus = [
  { title: "Dashboard", href: "/admin" },
  { title: "Books", href: "/admin/books" },
  { title: "Users", href: "/admin/users" },
  { title: "Loans", href: "/admin/loans" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <Sidebar collapsible="icon">
      {/* HEADER */}
      <SidebarHeader>
        <div className="px-2 text-lg font-bold">Admin Panel</div>
      </SidebarHeader>

      {/* MENU */}
      <SidebarContent>
        <SidebarMenu>
          {menus.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link href={item.href}>{item.title}</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* FOOTER (USER INFO) */}
      <SidebarFooter>
        <div className="flex items-center gap-3 p-2">
          <Avatar>
            <AvatarFallback>{user?.profile?.full_name?.[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1 text-sm">
            <p className="font-medium leading-none">
              {user?.profile?.full_name}
            </p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mx-2 mb-2"
          onClick={() => {
            logout();
            router.push("/");
          }}
        >
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
