"use client";

import { useEffect, useState } from "react";
import { Bell, MoreVertical, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notificationService } from "@/services/notification.service";

interface HeaderMoreMenuProps {
  isAuthenticated: boolean;
  settingsHref: string;
}

export default function HeaderMoreMenu({
  isAuthenticated,
  settingsHref,
}: HeaderMoreMenuProps) {
  const t = useTranslations("navbar");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchCount = async () => {
        try {
          const response = await notificationService.getUnreadCount();
          setUnreadCount(response.data.data.unread_count);
        } catch (error) {
          console.error("Failed to fetch unread count:", error);
        }
      };
      
      fetchCount();

      const interval = setInterval(fetchCount, 60000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="flex md:hidden h-9 w-9 text-muted-foreground hover:text-foreground"
          aria-label="More options"
        >
          <div className="relative">
            <MoreVertical className="h-4 w-4" />
            {isAuthenticated && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
              </span>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 p-2 rounded-xl shadow-xl border-border/50 backdrop-blur-sm"
      >
        <DropdownMenuItem asChild>
          <Link
            href={settingsHref}
            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg transition-colors focus:bg-accent"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Settings className="h-4 w-4" />
            </div>
            <span className="font-medium text-sm">{t("settings")}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/notifications"
            className="flex items-center justify-between px-3 py-2.5 cursor-pointer rounded-lg transition-colors focus:bg-accent"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                <Bell className="h-4 w-4" />
              </div>
              <span className="font-medium text-sm">{t("notifications")}</span>
            </div>
            {isAuthenticated && unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="h-5 min-w-5 flex items-center justify-center rounded-full px-1 text-[10px] font-bold shadow-sm shadow-destructive/20"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
