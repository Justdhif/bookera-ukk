"use client";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { Bell, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { notificationService } from "@/services/notification.service";
import { Notification } from "@/types/notification";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getNotificationIcon } from "@/components/custom-ui/content/notification/notification-utils";

interface NotificationDropdownProps {
  isAuthenticated: boolean;
}

export default function NotificationDropdown({
  isAuthenticated,
}: NotificationDropdownProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleNotificationReceived = () => {
      fetchNotifications();
      fetchUnreadCount();
    };

    window.addEventListener("notification-received", handleNotificationReceived);
    return () => {
      window.removeEventListener("notification-received", handleNotificationReceived);
    };
  }, []);

  useEffect(() => {
    const handleNotificationRead = (event: any) => {
      const notificationId = event.detail?.notificationId;
      
      if (notificationId) {
        setNotifications(
          notifications.map((n) =>
            n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
          )
        );
      }
      
      fetchUnreadCount();
    };

    window.addEventListener("notification-read", handleNotificationRead);
    return () => {
      window.removeEventListener("notification-read", handleNotificationRead);
    };
  }, [notifications]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const response = await notificationService.getNotifications({
        per_page: 5,
      });
      setNotifications(response.data.data.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data.data.unread_count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read_at) {
      try {
        await notificationService.markAsRead(notif.id);
        
        setNotifications(
          notifications.map((n) =>
            n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n
          )
        );
        
        fetchUnreadCount();
        
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("notification-read", { 
            detail: { notificationId: notif.id } 
          }));
        }
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }

    if (notif.module === "borrow" && notif.data?.borrow_id) {
      router.push(`/my-borrows/${notif.data.borrow_id}`);
    } else if (notif.module === "return" && notif.data?.return_id) {
      router.push(`/my-borrows/${notif.data.borrow_id}`);
    } else {
      router.push("/notifications");
    }
  };

  const handleViewAllNotifications = () => {
    router.push("/notifications");
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && isAuthenticated) {
      fetchNotifications();
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="relative flex items-center gap-2 h-9 px-3"
        >
          <Bell className="h-4 w-4" />
          <span className="hidden text-sm font-medium lg:block">Notifications</span>
          {isAuthenticated && unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} unread</Badge>
          )}
        </div>

        <div className="max-h-100 overflow-y-auto">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                Please login to view notifications
              </p>
              <Button
                size="sm"
                onClick={() => router.push("/login")}
              >
                Login
              </Button>
            </div>
          ) : isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={cn(
                    "p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                    !notif.read_at && "bg-blue-50/50 dark:bg-blue-950/20"
                  )}
                >
                  <div className="flex gap-3">
                    <div className="shrink-0 mt-1">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm line-clamp-1">
                          {notif.title}
                        </p>
                        {!notif.read_at && (
                          <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                        )}
                      </div>
                      {notif.message && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {notif.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(notif.created_at), "MMM dd, yyyy HH:mm")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isAuthenticated && notifications.length > 0 && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={handleViewAllNotifications}
            >
              <span>{"View all notifications"}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
