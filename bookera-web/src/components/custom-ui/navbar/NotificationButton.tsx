"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notificationService } from "@/services/notification.service";
import { useRouter } from "next/navigation";

export default function NotificationButton() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleNotificationReceived = () => {
      fetchUnreadCount();
    };

    window.addEventListener("notification-received", handleNotificationReceived);
    return () => {
      window.removeEventListener("notification-received", handleNotificationReceived);
    };
  }, []);

  useEffect(() => {
    const handleNotificationRead = () => {
      fetchUnreadCount();
    };

    window.addEventListener("notification-read", handleNotificationRead);
    return () => {
      window.removeEventListener("notification-read", handleNotificationRead);
    };
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data.data.unread_count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const handleClick = () => {
    router.push("/admin/notifications");
  };

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className="relative flex items-center gap-2 h-9 px-3"
    >
      <Bell className="h-4 w-4" />
      <span className="hidden text-sm font-medium lg:block">Notifications</span>
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </Button>
  );
}
