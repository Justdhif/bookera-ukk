"use client";

import { useEffect, useState } from "react";
import { notificationService } from "@/services/notification.service";
import { Notification } from "@/types/notification";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function NotificationPageClient() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getNotifications({
        per_page: 50,
      });
      setNotifications(response.data.data.data);
    } catch (error) {
      toast.error("Failed to load notifications");
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
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
    // Mark as read if not read yet
    if (!notif.read_at) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications(
          notifications.map((n) =>
            n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n
          )
        );
        fetchUnreadCount();
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }

    // Navigate based on notification type
    if (notif.module === "loan" && notif.data?.loan_id) {
      router.push(`/loans/${notif.data.loan_id}`);
    } else if (notif.module === "return" && notif.data?.return_id) {
      router.push(`/loans/${notif.data.loan_id}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
      fetchUnreadCount();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
      console.error("Failed to mark all as read:", error);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleDeleteNotification = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter((n) => n.id !== id));
      toast.success("Notification deleted");
      fetchUnreadCount();
    } catch (error) {
      toast.error("Failed to delete notification");
      console.error("Failed to delete notification:", error);
    }
  };

  const getNotificationIcon = (type: string | null) => {
    switch (type) {
      case "approved":
        return "✅";
      case "rejected":
        return "❌";
      case "borrow_request":
      case "return_request":
        return "📝";
      default:
        return "🔔";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-brand-primary" />
            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>
              <p className="text-muted-foreground">
                View and manage all your notifications
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
            >
              {isMarkingAll ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCheck className="h-4 w-4 mr-2" />
              )}
              Mark all as read
            </Button>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h3 className="font-semibold text-lg">All Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} unread</Badge>
            )}
          </div>

          <div className="max-h-150 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-lg font-medium mb-1">No notifications</p>
                <p className="text-sm text-muted-foreground">
                  You don't have any notifications yet
                </p>
              </div>
            ) : (
              <div className="divide-y dark:divide-gray-700">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      "p-4 hover:bg-muted/50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors",
                      !notif.read_at && "bg-blue-50/50 dark:bg-blue-950/20"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="text-2xl shrink-0">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">
                              {notif.title}
                            </p>
                            {!notif.read_at && (
                              <Badge variant="default" className="text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={(e) => handleDeleteNotification(notif.id, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {notif.message && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {notif.message}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>
                            {format(
                              new Date(notif.created_at),
                              "MMM dd, yyyy • HH:mm"
                            )}
                          </span>
                          {notif.module && (
                            <>
                              <span>•</span>
                              <Badge variant="secondary" className="text-xs">
                                {notif.module}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
