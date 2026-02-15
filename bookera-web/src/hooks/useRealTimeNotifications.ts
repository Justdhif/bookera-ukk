"use client";

import { useEffect, useCallback } from "react";
import { initializeEcho } from "@/lib/echo";
import { useAuthStore } from "@/store/auth.store";
import { getCookie } from "cookies-next";
import { toast } from "sonner";

let isSubscribed = false;
let echoInstance: any = null;

interface NotificationEvent {
  loan_id?: number;
  return_id?: number;
  fine_id?: number;
  lost_book_id?: number;
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
      const notificationConfig: Record<string, { 
        variant: 'success' | 'warning' | 'info' | 'error'
      }> = {
        borrow_request: { variant: 'info' },
        return_request: { variant: 'info' },
        approved: { variant: 'success' },
        rejected: { variant: 'error' },
        fine_created: { variant: 'warning' },
        lost_book_report: { variant: 'warning' },
      };

      const config = notificationConfig[event.type] || { variant: 'info' };
      
      const toastMethod = config.variant === 'success' ? toast.success :
                          config.variant === 'warning' ? toast.warning :
                          config.variant === 'error' ? toast.error :
                          toast.info;

      toastMethod(event.message, {
        duration: 5000,
        action: event.loan_id || event.fine_id || event.lost_book_id
          ? {
              label: "View",
              onClick: () => {
                if (event.fine_id) {
                  window.location.href = user?.role === "admin" 
                    ? `/admin/fines/${event.fine_id}`
                    : `/my-fines`;
                } else if (event.lost_book_id) {
                  window.location.href = `/admin/lost-books`;
                } else if (event.loan_id) {
                  window.location.href = user?.role === "admin" 
                    ? `/admin/loans`
                    : `/loans/${event.loan_id}`;
                }
              },
            }
          : undefined,
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("notification-received"));
      }

      if (onNotificationReceived) {
        onNotificationReceived();
      }
    },
    [user?.role, onNotificationReceived]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleNotificationRead = () => {
      if (onNotificationReceived) {
        onNotificationReceived();
      }
    };

    window.addEventListener("notification-read", handleNotificationRead);
    
    return () => {
      window.removeEventListener("notification-read", handleNotificationRead);
    };
  }, [onNotificationReceived]);

  useEffect(() => {
    if (!token || !user) {
      return;
    }

    if (isSubscribed) {
      return;
    }

    const echo = initializeEcho(token);
    echoInstance = echo;

    if (user.role === "admin") {
      echo
        .private("admin")
        .listen(".loan.requested", (event: NotificationEvent) => {
          handleNotification(event);
        })
        .listen(".return.requested", (event: NotificationEvent) => {
          handleNotification(event);
        })
        .listen(".lost-book.reported", (event: NotificationEvent) => {
          handleNotification(event);
        });
    } else {
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
        })
        .listen(".fine.created", (event: NotificationEvent) => {
          handleNotification(event);
        });
    }

    isSubscribed = true;

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

