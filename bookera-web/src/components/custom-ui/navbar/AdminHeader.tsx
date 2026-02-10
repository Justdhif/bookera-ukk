"use client";

import React, { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Settings, FileText, Shield } from "lucide-react";
import { notificationService } from "@/services/notification.service";
import { useTranslations } from "next-intl";

export default function AdminHeader() {
  const t = useTranslations('header');
  const pathname = usePathname();
  const router = useRouter();
  const segments = pathname.replace("/admin", "").split("/").filter(Boolean);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data.data.unread_count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  // Format segment untuk breadcrumb
  const formatSegment = (seg: string) => {
    // Capitalize first letter
    const formatted = seg.charAt(0).toUpperCase() + seg.slice(1);
    return formatted;
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b px-4">
      <SidebarTrigger />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">{t('dashboard')}</BreadcrumbLink>
          </BreadcrumbItem>

          {segments.map((seg, idx) => {
            const href = `/admin/${segments.slice(0, idx + 1).join("/")}`;

            return (
              <React.Fragment key={idx}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {idx === segments.length - 1 ? (
                    <BreadcrumbPage>{formatSegment(seg)}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={href}>
                      {formatSegment(seg)}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        {/* Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
              <Settings className="h-4 w-4 mr-2" />
              {t('settings')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/admin/terms-of-service")}>
              <FileText className="h-4 w-4 mr-2" />
              {t('termsOfService')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/admin/privacy-policy")}>
              <Shield className="h-4 w-4 mr-2" />
              {t('privacyPolicy')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => router.push("/admin/notifications")}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    </header>
  );
}
