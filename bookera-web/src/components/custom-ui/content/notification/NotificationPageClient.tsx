"use client";

import { useEffect, useState } from "react";
import { notificationService } from "@/services/notification.service";
import { Notification } from "@/types/notification";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import DeleteConfirmDialog from "@/components/custom-ui/DeleteConfirmDialog";
import NotificationList from "./NotificationList";
import NotificationDetail from "./NotificationDetail";

export default function NotificationPageClient() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
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
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
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
    setSelectedNotif(notif);

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
  };

  const handleNavigateToDetail = (notif: Notification) => {
    if (notif.module === "loan" && notif.data?.loan_id) {
      router.push(`/admin/loans`);
    } else if (notif.module === "return" && notif.data?.return_id) {
      router.push(`/admin/returns`);
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

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      await notificationService.deleteNotification(deleteId);
      setNotifications(notifications.filter((n) => n.id !== deleteId));
      toast.success("Notification deleted");
      fetchUnreadCount();
      setDeleteId(null);
      if (selectedNotif?.id === deleteId) {
        setSelectedNotif(null);
      }
    } catch (error) {
      toast.error("Failed to delete notification");
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
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

        <div className="lg:col-span-7">
          <NotificationDetail
            notification={selectedNotif}
            onClose={() => setSelectedNotif(null)}
            onNavigate={handleNavigateToDetail}
            onDelete={setDeleteId}
          />
        </div>
      </div>
      
      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Notification"
        description="Are you sure you want to delete this notification? This action cannot be undone."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
