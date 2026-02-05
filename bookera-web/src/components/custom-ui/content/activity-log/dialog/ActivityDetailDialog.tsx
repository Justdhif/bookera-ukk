"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { activityLogService } from "@/services/activity-log.service";
import { ActivityLog } from "@/types/activity-log";
import { toast } from "sonner";
import { Calendar, Globe, Monitor, User } from "lucide-react";

interface ActivityDetailDialogProps {
  activityId: number | null;
  open: boolean;
  onClose: () => void;
}

export default function ActivityDetailDialog({
  activityId,
  open,
  onClose,
}: ActivityDetailDialogProps) {
  const [detail, setDetail] = useState<ActivityLog | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activityId && open) {
      fetchDetail();
    }
  }, [activityId, open]);

  const fetchDetail = async () => {
    if (!activityId) return;

    setLoading(true);
    try {
      const response = await activityLogService.show(activityId);
      setDetail(response.data.data);
    } catch (error) {
      toast.error("Gagal memuat detail activity log");
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      login: "bg-blue-100 text-blue-800",
      logout: "bg-gray-100 text-gray-800",
      create: "bg-green-100 text-green-800",
      update: "bg-yellow-100 text-yellow-800",
      delete: "bg-red-100 text-red-800",
    };
    return colors[action] || "bg-gray-100 text-gray-800";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-bold bg-linear-to-r from-brand-primary to-brand-primary-dark bg-clip-text text-transparent">
            Detail Activity Log
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        ) : detail ? (
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-linear-to-br from-brand-primary/5 to-brand-primary-dark/5 dark:from-brand-primary/10 dark:to-brand-primary-dark/10 p-5 rounded-xl border border-brand-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-brand-primary/10 rounded-lg">
                  <User className="h-5 w-5 text-brand-primary" />
                </div>
                <h3 className="font-semibold text-lg">User Information</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nama:</span>
                  <span className="font-medium">
                    {detail.user?.profile?.full_name || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{detail.user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <Badge variant="outline">{detail.user?.role}</Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Activity Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="font-semibold text-lg">Activity Information</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Action:</span>
                  <Badge className={getActionColor(detail.action)}>
                    {detail.action}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Module:</span>
                  <Badge variant="outline">{detail.module}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description:</span>
                  <span className="font-medium text-right">
                    {detail.description}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">
                    {new Date(detail.created_at).toLocaleString("id-ID", {
                      dateStyle: "full",
                      timeStyle: "medium",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Network Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Globe className="h-5 w-5 text-purple-500" />
                </div>
                <h3 className="font-semibold text-lg">Network Information</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IP Address:</span>
                  <span className="font-mono">{detail.ip_address}</span>
                </div>
              </div>
            </div>

            {/* User Agent */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Monitor className="h-5 w-5 text-orange-500" />
                </div>
                <h3 className="font-semibold text-lg">User Agent</h3>
              </div>
              <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-xl break-all border">
                {detail.user_agent}
              </p>
            </div>

            {/* Old Data */}
            {detail.old_data && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    Data Lama
                  </h3>
                  <pre className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl text-xs overflow-x-auto border-2 border-red-200 dark:border-red-900/50">
                    {JSON.stringify(detail.old_data, null, 2)}
                  </pre>
                </div>
              </>
            )}

            {/* New Data */}
            {detail.new_data && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                    Data Baru
                  </h3>
                  <pre className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl text-xs overflow-x-auto border-2 border-brand-primary/30">
                    {JSON.stringify(detail.new_data, null, 2)}
                  </pre>
                </div>
              </>
            )}

            {/* Subject */}
            {detail.subject && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    Related Data
                  </h3>
                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline">{detail.subject_type}</Badge>
                    </div>
                  </div>
                  <pre className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl text-xs overflow-x-auto border-2 border-purple-200 dark:border-purple-900/50">
                    {JSON.stringify(detail.subject, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
