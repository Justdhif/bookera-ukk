"use client";

import { Notification } from "@/types/notification";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, X, ExternalLink, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { getNotificationIcon } from "./notification-utils";
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
  if (!notification) {
    return (
      <Card className="h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-3 p-8">
            <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold">{"Select a notification"}</h3>
            <p className="text-muted-foreground max-w-sm">
              {"Click on any notification from the list to view its details here."}
            </p>
            <p className="text-sm text-muted-foreground">
              {"Press ESC to deselect"}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{"Notification Detail"}</h3>
          <div className="flex items-center gap-2">
            {notification.module && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate(notification)}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                {"View Full Detail"}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="overflow-y-auto h-[calc(100%-5rem)] p-6">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 mt-1">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{notification.title}</h2>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>
                  {format(
                    new Date(notification.created_at),
                    "MMMM dd, yyyy 'at' HH:mm"
                  )}
                </span>
                {notification.read_at && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <CheckCheck className="h-3 w-3" />
                      {"Read"}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {notification.message && (
            <div className="bg-muted/50 dark:bg-muted/20 rounded-lg p-4">
              <p className="text-base leading-relaxed">{notification.message}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {notification.module && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">{"Module"}</p>
                <Badge variant="secondary" className="text-sm">
                  {notification.module}
                </Badge>
              </div>
            )}
            {notification.type && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">{"Type"}</p>
                <Badge variant="outline" className="text-sm">
                  {notification.type}
                </Badge>
              </div>
            )}
          </div>

          {notification.data && Object.keys(notification.data).length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">{"Additional Information"}</h3>
              <div className="bg-muted/50 dark:bg-muted/20 rounded-lg p-4 space-y-2">
                {Object.entries(notification.data).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-3 text-sm">
                    <span className="text-muted-foreground min-w-30 capitalize">
                      {key.replace(/_/g, " ")}:
                    </span>
                    <span className="font-medium flex-1">
                      {typeof value === "object"
                        ? JSON.stringify(value, null, 2)
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(notification.id)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {"Delete Notification"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
