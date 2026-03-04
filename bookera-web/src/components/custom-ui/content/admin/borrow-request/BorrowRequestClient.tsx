"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { borrowRequestService } from "@/services/borrow-request.service";
import { BorrowRequest } from "@/types/borrow-request";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  ClipboardList,
  User,
  Calendar,
  BookOpen,
  ArrowRight,
  Trash,
} from "lucide-react";
import EmptyState from "@/components/custom-ui/EmptyState";
import { format } from "date-fns";
import DeleteConfirmDialog from "@/components/custom-ui/DeleteConfirmDialog";

const approvalStatusConfig: Record<
  BorrowRequest["approval_status"],
  { label: string; className: string }
> = {
  processing: {
    label: "Processing",
    className: "bg-violet-100 text-violet-700 hover:bg-violet-100",
  },
  approved: {
    label: "Approved",
    className: "bg-green-100 text-green-700 hover:bg-green-100",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 hover:bg-red-100",
  },
  canceled: {
    label: "Canceled",
    className: "bg-gray-100 text-gray-600 hover:bg-gray-100",
  },
};

export default function BorrowRequestClient() {
  const router = useRouter();
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await borrowRequestService.getAll(searchQuery);
      setRequests(res.data.data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load borrow requests",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchRequests();
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await borrowRequestService.destroy(deleteId);
      toast.success("Request deleted successfully");
      setDeleteId(null);
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete request");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Borrow Requests</h1>
          <p className="text-muted-foreground">
            List of borrow requests from members
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or book title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch} variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-16 w-16" />}
          title="No Requests"
          description="No borrow requests from members yet"
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const statusCfg =
              approvalStatusConfig[req.approval_status] ??
              approvalStatusConfig.processing;
            return (
              <Card key={req.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className={`text-xs ${statusCfg.className}`}>
                          {statusCfg.label}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          <span>
                            {req.user?.profile?.full_name || req.user?.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            Borrow:{" "}
                            {format(new Date(req.borrow_date), "dd MMM yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            Return:{" "}
                            {format(new Date(req.return_date), "dd MMM yyyy")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5 text-sm">
                        <BookOpen className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">
                          {req.borrow_request_details
                            ?.map((d) => d.book?.title)
                            .join(", ") || "-"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(req.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="brand"
                        onClick={() =>
                          router.push(`/admin/borrow-requests/${req.id}`)
                        }
                      >
                        Detail
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Borrow Request"
        description="Are you sure you want to delete this borrow request? This action cannot be undone."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
