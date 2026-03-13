"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Notification } from "@/types/notification";
import { Input } from "@/components/ui/input";
import { Loader2, Bell, Search, CheckCheck, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { NotificationIconBadge, getModuleBadgeStyle } from "./notification-utils";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/custom-ui/EmptyState";

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  selectedId: number | null;
  unreadCount: number;
  onSelectNotification: (notif: Notification) => void;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
  onMarkAllAsRead: () => void;
  isMarkingAll?: boolean;
}

export default function NotificationList({
  notifications,
  loading,
  selectedId,
  unreadCount,
  onSelectNotification,
  onSearchChange,
  onStatusChange,
  onMarkAllAsRead,
  isMarkingAll = false,
}: NotificationListProps) {
  const t = useTranslations("notification");
  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState("all");

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearchChange(value);
  };

  const handleStatusClick = (status: string) => {
    setStatusValue(status);
    onStatusChange(status);
  };

  const statusOptions = [
    { value: "all", label: t("allStatus") },
    { value: "unread", label: t("unread") },
    { value: "read", label: t("read") },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">{t("allNotifications")}</h3>
              <p className="text-xs text-muted-foreground">
                {notifications.length} {t("notificationsCount")}
                {unreadCount > 0 && (
                  <span className="ml-1 font-medium text-primary">
                    · {unreadCount} {t("unread")}
                  </span>
                )}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="brand"
              size="sm"
              onClick={onMarkAllAsRead}
              disabled={isMarkingAll}
              className="h-8 text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
            >
              {isMarkingAll ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5" />
              )}
              {t("markAllAsRead")}
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={t("searchNotifications")}
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 h-8 text-sm bg-muted/40 border-border/60 focus:bg-background"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5">
          <Filter className="h-3 w-3 text-muted-foreground shrink-0" />
          <div className="flex gap-1.5">
            {statusOptions.map((option) => {
              const isActive = statusValue === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleStatusClick(option.value)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150",
                    isActive
                      ? "bg-brand-primary text-white shadow-sm"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {option.label}
                  {option.value === "unread" && unreadCount > 0 && (
                    <span className={cn(
                      "ml-1 inline-flex items-center justify-center rounded-full text-[10px] font-bold min-w-4 h-4 px-1",
                      isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/15 text-primary"
                    )}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notification list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-primary/60" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<Bell />}
            title={t("noNotifications")}
            description={t("noNotificationsMatch")}
            className="h-full border-0"
          />
        ) : (
          <div className="divide-y divide-border/50">
            {notifications.map((notif) => {
              const isSelected = selectedId === notif.id;
              const isUnread = !notif.read_at;

              return (
                <div
                  key={notif.id}
                  onClick={() => onSelectNotification(notif)}
                  className={cn(
                    "relative flex gap-3 p-3.5 cursor-pointer transition-all duration-150 group",
                    isSelected
                      ? "bg-primary/8 dark:bg-primary/12"
                      : isUnread
                      ? "bg-blue-50/40 dark:bg-blue-950/10 hover:bg-muted/60"
                      : "hover:bg-muted/50",
                    isSelected && "border-l-[3px] border-l-primary pl-2.75"
                  )}
                >
                  {/* Unread dot */}
                  {isUnread && !isSelected && (
                    <span className="absolute right-3 top-3.5 h-2 w-2 rounded-full bg-primary shadow-sm shadow-primary/30" />
                  )}

                  {/* Icon */}
                  <NotificationIconBadge
                    type={notif.type}
                    module={notif.module}
                    size="default"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-3">
                    <p className={cn(
                      "text-sm line-clamp-1 leading-snug",
                      isUnread ? "font-semibold text-foreground" : "font-medium text-foreground/90"
                    )}>
                      {notif.title}
                    </p>
                    {notif.message && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      {notif.module && (
                        <span className={cn(
                          "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border",
                          getModuleBadgeStyle(notif.module)
                        )}>
                          {notif.module}
                        </span>
                      )}
                      <span className="text-[11px] text-muted-foreground/70">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
