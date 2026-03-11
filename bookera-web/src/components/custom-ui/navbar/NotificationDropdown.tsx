"use client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState, useRef } from "react";
import { Bell, ChevronRight, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/custom-ui/EmptyState";
import { motion, AnimatePresence } from "framer-motion";
import { notificationService } from "@/services/notification.service";
import { Notification } from "@/types/notification";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { NotificationIconBadge } from "@/components/custom-ui/content/notification/notification-utils";

interface NotificationDropdownProps {
  isAuthenticated?: boolean;
}

export default function NotificationDropdown({
  isAuthenticated = true,
}: NotificationDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("navbar");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAdmin = pathname.startsWith("/admin");
  const notificationsHref = "/notifications";

  useEffect(() => {
    const handleNotificationReceived = () => {
      fetchNotifications();
      fetchUnreadCount();
    };
    window.addEventListener("notification-received", handleNotificationReceived);
    return () => window.removeEventListener("notification-received", handleNotificationReceived);
  }, []);

  useEffect(() => {
    const handleNotificationRead = (event: any) => {
      const notificationId = event.detail?.notificationId;
      if (notificationId) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n,
          ),
        );
      }
      fetchUnreadCount();
    };
    window.addEventListener("notification-read", handleNotificationRead);
    return () => window.removeEventListener("notification-read", handleNotificationRead);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchUnreadCount();
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const response = await notificationService.getNotifications({ per_page: 5 });
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
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n,
          ),
        );
        fetchUnreadCount();
        window.dispatchEvent(
          new CustomEvent("notification-read", { detail: { notificationId: notif.id } }),
        );
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }

    if (isAdmin) {
      if (notif.module === "borrow" && notif.data?.borrow_id) {
        router.push(`/admin/borrows/${notif.data.borrow_id}`);
      } else {
        router.push("/notifications");
      }
    } else {
      if (notif.module === "borrow" && notif.data?.borrow_id) {
        router.push(`/my-borrows/${notif.data.borrow_id}`);
      } else if (notif.module === "return" && notif.data?.borrow_id) {
        router.push(`/my-borrows/${notif.data.borrow_id}`);
      } else {
        router.push("/notifications");
      }
    }

    setIsOpen(false);
  };

  const handleMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (!isOpen) {
      setIsOpen(true);
      fetchNotifications();
    }
  };

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Button
        variant="ghost"
        className="relative flex items-center gap-2 h-9 px-3"
      >
        <Bell className="h-4 w-4" />
        <span className="hidden text-sm font-medium lg:block">
          {t("notifications")}
        </span>
        {isAuthenticated && unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-1 z-50 w-96 rounded-xl border bg-popover shadow-lg"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">{t("notifications")}</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary">{t("unread", { count: unreadCount })}</Badge>
              )}
            </div>

            <div className="max-h-100 overflow-y-auto">
              {!isAuthenticated ? (
                <EmptyState
                  variant="compact"
                  icon={<Bell className="h-6 w-6" />}
                  title={t("loginToView")}
                  linkLabel={t("login")}
                  linkHref="/login"
                />
              ) : isLoading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {t("loading")}
                </div>
              ) : notifications.length === 0 ? (
                <EmptyState
                  variant="compact"
                  icon={<Bell className="h-6 w-6" />}
                  title={t("noNotifications")}
                />
              ) : (
                <div className="divide-y">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={cn(
                        "p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                        !notif.read_at && "bg-primary/5 dark:bg-primary/10",
                      )}
                    >
                      <div className="flex gap-3">
                        <div className="shrink-0 mt-0.5">
                          <NotificationIconBadge type={notif.type} module={notif.module} size="sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm line-clamp-1">{notif.title}</p>
                            {!notif.read_at && (
                              <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1 shadow-sm shadow-primary/30" />
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
                  onClick={() => {
                    router.push(notificationsHref);
                    setIsOpen(false);
                  }}
                >
                  <span>{t("viewAllNotifications")}</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
