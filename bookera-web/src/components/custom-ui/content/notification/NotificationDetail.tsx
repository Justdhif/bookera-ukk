"use client";

import { useTranslations } from "next-intl";
import { Notification } from "@/types/notification";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, X, ExternalLink, Trash2, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { NotificationIconBadge, getModuleBadgeStyle, getNotificationIconConfig } from "./notification-utils";
import { cn } from "@/lib/utils";

interface NotificationDetailProps {
  notification: Notification | null;
  onClose: () => void;
  onNavigate: (notif: Notification) => void;
  onDelete: (id: number) => void;
}

export default function NotificationDetail({
  notification,
  onClose,
  onNavigate,
  onDelete,
}: NotificationDetailProps) {
  const t = useTranslations("notification");

  if (!notification) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-7rem)] rounded-xl border border-dashed border-border/70 bg-muted/20">
        <div className="text-center space-y-4 p-8 max-w-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 mx-auto">
            <Bell className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground/80">{t("selectNotification")}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t("clickToView")}</p>
          </div>
          <p className="text-xs text-muted-foreground/60 bg-muted/40 rounded-lg px-3 py-2">
            {t("pressEsc")}
          </p>
        </div>
      </div>
    );
  }

  const config = getNotificationIconConfig(notification.type, notification.module);

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{t("notificationDetail")}</h3>
          {notification.read_at && (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-medium">
              <CheckCheck className="h-3 w-3" />
              {t("read")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {notification.module && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate(notification)}
              className="h-7 text-xs gap-1.5 border-border/60"
            >
              <ExternalLink className="h-3 w-3" />
              {t("viewFullDetail")}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero section */}
        <div className={cn("px-5 py-5 border-b border-border/50", config.bg)}>
          <div className="flex items-start gap-4">
            <NotificationIconBadge
              type={notification.type}
              module={notification.module}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-foreground leading-tight mb-2">
                {notification.title}
              </h2>
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(notification.created_at), "MMM dd, yyyy · HH:mm")}
                </span>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-muted-foreground/70">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Message */}
          {notification.message && (
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="text-sm leading-relaxed text-foreground/90">{notification.message}</p>
            </div>
          )}

          {/* Meta badges */}
          {(notification.module || notification.type) && (
            <div className="flex flex-wrap gap-2">
              {notification.module && (
                <div className="flex flex-col gap-1">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t("module")}</p>
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border",
                    getModuleBadgeStyle(notification.module)
                  )}>
                    {notification.module}
                  </span>
                </div>
              )}
              {notification.type && (
                <div className="flex flex-col gap-1">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{t("type")}</p>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border border-border bg-background text-foreground/80">
                    {notification.type.replace(/_/g, " ")}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Additional data */}
          {notification.data && Object.keys(notification.data).length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{t("additionalInfo")}</p>
              <div className="rounded-lg border border-border/60 bg-muted/20 overflow-hidden">
                {Object.entries(notification.data).map(([key, value], idx) => (
                  <div
                    key={key}
                    className={cn(
                      "flex items-start gap-4 px-4 py-2.5 text-sm",
                      idx !== 0 && "border-t border-border/40"
                    )}
                  >
                    <span className="text-muted-foreground capitalize min-w-28 text-xs pt-0.5">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="font-medium text-foreground/90 flex-1 break-all">
                      {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-border bg-muted/20">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(notification.id)}
          className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 hover:border-destructive/50 h-8 text-xs"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t("deleteNotification")}
        </Button>
      </div>
    </div>
  );
}
