"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Bell, CheckCheck, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { notificationService } from "@/services/notification.service";
import { Notification } from "@/types/notification";
import { useAuthStore } from "@/store/auth.store";
import { NotificationIconBadge } from "@/components/custom-ui/content/notification/notification-utils";
import { useTranslations } from "next-intl";
import EmptyState from "@/components/custom-ui/EmptyState";

export default function DiscussionNotificationsPanel() {
  const { isAuthenticated } = useAuthStore();
  const t = useTranslations("notification");
  const tD = useTranslations("discussion");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications({
        per_page: 20,
        module: "discussion",
      });
      setNotifications(res.data.data.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.data.data.unread_count);
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchNotifications();
    fetchUnreadCount();
  }, [isAuthenticated]);

  useEffect(() => {
    const handler = () => {
      fetchNotifications();
      fetchUnreadCount();
    };
    window.addEventListener("notification-received", handler);
    return () => window.removeEventListener("notification-received", handler);
  }, []);

  const handleMarkAll = async () => {
    setIsMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read_at: n.read_at ?? new Date().toISOString(),
        })),
      );
      setUnreadCount(0);
    } catch {
      // silently fail
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleClick = async (notif: Notification) => {
    if (!notif.read_at) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        window.dispatchEvent(
          new CustomEvent("notification-read", {
            detail: { notificationId: notif.id },
          }),
        );
      } catch {
        // silently fail
      }
    }
  };

  return (
    <div className="w-80 shrink-0 border-l border-border/60 h-full flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">{t("title")}</span>
          {unreadCount > 0 && (
            <span className="flex items-center justify-center h-5 min-w-5 rounded-full bg-brand-primary text-white text-xs font-bold px-1">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAll}
            disabled={isMarkingAll}
            className="h-7 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10 px-2"
          >
            {isMarkingAll ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <CheckCheck className="h-3 w-3" />
            )}
            {t("markAllAsRead")}
          </Button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {!isAuthenticated ? (
          <EmptyState
            variant="compact"
            icon={<Bell className="h-6 w-6" />}
            title={t("loginToViewDiscussion")}
            linkLabel={tD("signIn")}
            linkHref="/login"
          />
        ) : loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            variant="compact"
            icon={<Bell className="h-6 w-6" />}
            title={t("noDiscussionNotifications")}
          />
        ) : (
          <div className="divide-y divide-border/40">
            {notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={cn(
                  "w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors",
                  !notif.read_at && "bg-primary/5",
                )}
              >
                <NotificationIconBadge
                  type={notif.type}
                  module={notif.module}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm leading-tight truncate",
                      !notif.read_at && "font-semibold",
                    )}
                  >
                    {notif.title}
                  </p>
                  {notif.message && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notif.created_at), {
                      addSuffix: true,
                      locale: idLocale,
                    })}
                  </p>
                </div>
                {!notif.read_at && (
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-border/50 p-3">
        <Link href="/discussion/notifications">
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {t("viewAllDiscussionNotifications")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
