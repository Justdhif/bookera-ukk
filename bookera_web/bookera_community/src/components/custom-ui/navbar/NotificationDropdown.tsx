"use client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState, useRef } from "react";
import { Bell, ChevronRight, LogIn, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

  const notificationsHref = "/notifications";
  const NOTIFICATION_MODULE = "discussion";

  useEffect(() => {
    if (isAuthenticated) fetchUnreadCount();
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const response = await notificationService.getAll({
        per_page: 5,
        module: NOTIFICATION_MODULE,
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
      const response = await notificationService.getUnreadCount({
        module: NOTIFICATION_MODULE,
      });
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
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }

    const postSlug = (notif.data as any)?.post_slug as string | undefined;
    if (postSlug) {
      router.push(`/discussion/${postSlug}`);
    } else {
      router.push("/notifications");
    }

    setIsOpen(false);
  };

  const handleMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (!isOpen) {
      setIsOpen(true);
      fetchNotifications();
      fetchUnreadCount();
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
        variant="outline"
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
                  icon={<Bell />}
                  title={t("loginToView")}
                  linkLabel={t("login")}
                  linkHref="/login"
                />
              ) : isLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/5" />
                        <Skeleton className="h-3 w-4/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <EmptyState
                  variant="compact"
                  icon={<Bell />}
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
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => {
                    router.push(notificationsHref);
                    setIsOpen(false);
                  }}
                >
                                  <Eye className="w-4 h-4 mr-2" /> <span>{t("viewAllNotifications")}</span><ChevronRight className="h-4 w-4" />
                              </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
