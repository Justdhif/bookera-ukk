"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
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
import BookeraLogo from "@/assets/logo/bookera-logo-hd.png";
import { LogOut, Settings, User, Book, HomeIcon } from "lucide-react";

const menus = [
  { title: "Dashboard", href: "/admin", icon: HomeIcon },
  { title: "Books", href: "/admin/books", icon: Book },
  { title: "Users", href: "/admin/users", icon: User },
  { title: "Loans", href: "/admin/loans", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <Sidebar variant="floating" collapsible="icon" className="p-4">
      {/* HEADER */}
      <SidebarHeader>
        <Link href="/admin" className="flex items-center space-x-2">
          <Image
            src={BookeraLogo}
            alt="Bookera Logo"
            width={32}
            height={32}
            className="h-15 w-15 object-cover"
          />
          <div>
            <span className="font-bold">Bookera</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-xs font-bold">Admin</span>
            </div>
          </div>
        </Link>
      </SidebarHeader>

      {/* MENU */}
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menus.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link href={item.href}>
                  {" "}
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
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
          variant="destructive"
          size="sm"
          className="mx-2 mb-2"
          onClick={() => {
            logout();
            router.push("/");
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
