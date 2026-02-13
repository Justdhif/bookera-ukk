"use client";

import { useEffect, useCallback } from "react";
import { initializeEcho } from "@/lib/echo";
import { useAuthStore } from "@/store/auth.store";
import { getCookie } from "cookies-next";
import { toast } from "sonner";

// Global variable to track subscription status (singleton pattern)
let isSubscribed = false;
let echoInstance: any = null;

interface NotificationEvent {
  loan_id?: number;
  return_id?: number;
  user_name?: string;
  message: string;
  type: string;
  reason?: string;
}

export const useRealTimeNotifications = (
  onNotificationReceived?: () => void
) => {
  const { user } = useAuthStore();
  const token = getCookie("token") as string | undefined;

  const handleNotification = useCallback(
    (event: NotificationEvent) => {
      // Show toast notification
      const notificationTypes: Record<string, string> = {
        borrow_request: "⚠️",
        return_request: "📦",
        approved: "✅",
        rejected: "❌",
      };

      const icon = notificationTypes[event.type] || "🔔";
      toast.info(`${icon} ${event.message}`, {
        duration: 5000,
        action: event.loan_id
          ? {
              label: "View",
              onClick: () => {
                window.location.href = user?.role === "admin" 
                  ? `/admin/loans`
                  : `/loans/${event.loan_id}`;
              },
            }
          : undefined,
      });

      // Trigger custom event to refresh notification list
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("notification-received"));
      }

      // Callback to refresh notification list
      if (onNotificationReceived) {
        onNotificationReceived();
      }
    },
    [user?.role, onNotificationReceived]
  );

  useEffect(() => {
    if (!token || !user) {
      return;
    }

    // Prevent multiple subscriptions using global variable
    if (isSubscribed) {
      return;
    }

    // Initialize Echo (only once)
    const echo = initializeEcho(token);
    echoInstance = echo;

    // Subscribe to appropriate channels based on user role
    if (user.role === "admin") {
      // Admin listens to admin channel for loan/return requests
      echo
        .private("admin")
        .listen(".loan.requested", (event: NotificationEvent) => {
          handleNotification(event);
        })
        .listen(".return.requested", (event: NotificationEvent) => {
          handleNotification(event);
        });
    } else {
      // Regular users listen to their personal channel
      echo
        .private(`user.${user.id}`)
        .listen(".loan.approved", (event: NotificationEvent) => {
          handleNotification(event);
        })
        .listen(".loan.rejected", (event: NotificationEvent) => {
          handleNotification(event);
        })
        .listen(".return.approved", (event: NotificationEvent) => {
          handleNotification(event);
        });
    }

    // Mark as subscribed globally
    isSubscribed = true;

    // Cleanup on unmount
    return () => {
      isSubscribed = false;
      
      if (echoInstance && user) {
        if (user.role === "admin") {
          echoInstance.leave("admin");
        } else {
          echoInstance.leave(`user.${user.id}`);
        }
      }
      
      echoInstance = null;
    };
  }, [token, user, handleNotification]);
};

