"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { notificationService } from "@/services/notification.service";
import {
  Notification,
  NotificationFilterParams,
} from "@/types/notification";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/custom-ui/modal/DeleteConfirmDialog";
import NotificationList from "./NotificationList";
import NotificationDetail from "./NotificationDetail";

import NotificationDetailSheet from "./NotificationDetailSheet";

export default function NotificationPageClient() {
  const t = useTranslations("notification");
  const [isMobile, setIsMobileState] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)");
    const onChange = () => setIsMobileState(mql.matches);
    mql.addEventListener("change", onChange);
    setIsMobileState(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedNotif(null);
        setIsDetailOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const fetchNotifications = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const filters: NotificationFilterParams = { per_page: 50 };
      const response = await notificationService.getAll(filters);
      setNotifications(response.data.data.data);
    } catch (error) {
      toast.error(t("failedLoadNotifications"));
      console.error("Failed to fetch notifications:", error);
    } finally {
      if (!silent) setLoading(false);
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
    if (isMobile) {
      setIsDetailOpen(true);
    }
    
    if (!notif.read_at) {
      try {
        await notificationService.markAsRead(notif.id);
        const updatedNotif = { ...notif, read_at: new Date().toISOString() };
        setNotifications(
          notifications.map((n) => (n.id === notif.id ? updatedNotif : n)),
        );
        setSelectedNotif(updatedNotif);
        fetchUnreadCount();
      } catch (error) {
        console.error("Failed to mark as read:", error);
        setSelectedNotif(notif);
      }
    } else {
      setSelectedNotif(notif);
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      fetchNotifications(true);
      fetchUnreadCount();
      toast.success(t("allMarkedReadSuccess"));
    } catch (error) {
      toast.error(t("allMarkedReadError"));
      console.error("Failed to mark all as read:", error);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await notificationService.delete(deleteId);
      setNotifications(notifications.filter((n) => n.id !== deleteId));
      toast.success(t("notifDeletedSuccess"));
      fetchUnreadCount();
      setDeleteId(null);
      if (selectedNotif?.id === deleteId) {
        setSelectedNotif(null);
        setIsDetailOpen(false);
      }
    } catch (error) {
      toast.error(t("failedDeleteNotification"));
      console.error("Failed to delete notification:", error);
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch =
      searchQuery === "" ||
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "read" && notif.read_at) ||
      (statusFilter === "unread" && !notif.read_at);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        <div className="col-span-1 lg:col-span-5">
          <NotificationList
            notifications={filteredNotifications}
            loading={loading}
            selectedId={selectedNotif?.id || null}
            unreadCount={unreadCount}
            onSelectNotification={handleNotificationClick}
            onSearchChange={setSearchQuery}
            onStatusChange={setStatusFilter}
            onMarkAllAsRead={handleMarkAllAsRead}
            isMarkingAll={isMarkingAll}
          />
        </div>
        <div className="hidden lg:block lg:col-span-7">
          <NotificationDetail
            notification={selectedNotif}
            onClose={() => setSelectedNotif(null)}
            onDelete={setDeleteId}
            className="h-[calc(100vh-8rem)] rounded-xl border border-border bg-card shadow-sm overflow-hidden"
          />
        </div>
      </div>

      {isMobile && (
        <NotificationDetailSheet
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          notification={selectedNotif}
          onDelete={(id) => setDeleteId(id)}
        />
      )}

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t("deleteNotification")}
        description={t("confirmDeleteDesc")}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

