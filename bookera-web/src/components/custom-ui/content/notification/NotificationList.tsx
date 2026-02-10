"use client";

import { useState } from "react";
import { Notification } from "@/types/notification";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Bell, Search, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getNotificationIcon } from "./notification-utils";
import { Button } from "@/components/ui/button";

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
  const t = useTranslations('admin.notifications');
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
    { value: "all", label: t('allStatus') },
    { value: "unread", label: t('unread') },
    { value: "read", label: t('read') },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">{t('allNotifications')}</h3>
          {notifications.length > 0 && (
            <Badge variant="secondary">{notifications.length}</Badge>
          )}
        </div>

        {unreadCount > 0 && onMarkAllAsRead && (
          <div className="mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllAsRead}
              disabled={isMarkingAll}
              className="w-full justify-center"
            >
              {isMarkingAll ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCheck className="h-4 w-4 mr-2" />
              )}
              {t('markAllAsRead')}
            </Button>
          </div>
        )}

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchNotifications')}
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">{t('statusFilter')}</p>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => {
                const isActive = statusValue === option.value;
                return (
                  <Badge
                    key={option.value}
                    variant={isActive ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer whitespace-nowrap transition-all duration-200",
                      "px-3 py-1.5 text-sm font-medium rounded-md border",
                      isActive
                        ? "bg-brand-primary text-primary-foreground border-brand-primary shadow-sm"
                        : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground hover:border-primary/50",
                    )}
                    onClick={() => handleStatusClick(option.value)}
                  >
                    {option.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="text-xs text-muted-foreground pt-1">
            {notifications.length} {t('notificationsCount')}
            {unreadCount > 0 && ` • ${unreadCount} ${t('unreadCount')}`}
          </div>
        </div>
      </CardHeader>

      <div className="overflow-y-auto h-[calc(100%-14rem)]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-lg font-medium mb-1">{t('noNotifications')}</p>
            <p className="text-sm text-muted-foreground">
              {t('noNotificationsMatch')}
            </p>
          </div>
        ) : (
          <div className="divide-y dark:divide-gray-700">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => onSelectNotification(notif)}
                className={cn(
                  "p-4 hover:bg-muted/50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors",
                  !notif.read_at && "bg-blue-50/50 dark:bg-blue-950/20",
                  selectedId === notif.id &&
                    "bg-brand-primary/10 dark:bg-brand-primary/20 border-l-4 border-brand-primary",
                )}
              >
                <div className="flex gap-3">
                  <div className="shrink-0 mt-1">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-1">
                        <p className="font-medium text-sm line-clamp-1">
                          {notif.title}
                        </p>
                        {!notif.read_at && (
                          <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                        )}
                      </div>
                    </div>
                    {notif.message && (
                      <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
                        {notif.message}
                      </p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(notif.created_at), "MMM dd, HH:mm")}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
