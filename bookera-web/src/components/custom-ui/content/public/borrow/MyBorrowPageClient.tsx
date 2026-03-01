"use client";

import { useEffect, useState } from "react";
import { borrowService } from "@/services/borrow.service";
import { borrowRequestService } from "@/services/borrow-request.service";
import { Borrow } from "@/types/borrow";
import { BorrowRequest } from "@/types/borrow-request";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import EmptyState from "@/components/custom-ui/EmptyState";
import { ReportLostDialog } from "./ReportLostDialog";
import { ReturnDialog } from "./ReturnDialog";
import {
  PackageX,
  BookOpen,
  Calendar,
  AlertCircle,
  Eye,
  ClipboardList,
  QrCode,
  Trash2,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function MyBorrowPageClient() {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loadingBorrows, setLoadingBorrows] = useState(true);
  const [returnDialog, setReturnDialog] = useState<{
    open: boolean;
    borrow: Borrow | null;
  }>({ open: false, borrow: null });
  const [reportLostDialog, setReportLostDialog] = useState<{
    open: boolean;
    borrow: Borrow | null;
  }>({ open: false, borrow: null });

  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [qrDialog, setQrDialog] = useState<BorrowRequest | null>(null);

  useEffect(() => {
    fetchBorrows();
    fetchRequests();
  }, []);

  const fetchBorrows = async () => {
    setLoadingBorrows(true);
    try {
      const response = await borrowService.getMyBorrows();
      setBorrows(response.data.data);
    } catch (error) {
      console.error("Failed to fetch borrows:", error);
    } finally {
      setLoadingBorrows(false);
    }
  };

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await borrowRequestService.getMyRequests();
      setRequests(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memuat permintaan peminjaman");
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleDeleteRequest = async (id: number) => {
    if (!confirm("Yakin ingin membatalkan permintaan ini?")) return;
    setDeletingId(id);
    try {
      await borrowRequestService.cancelRequest(id);
      toast.success("Permintaan berhasil dibatalkan");
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal membatalkan permintaan");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (borrow: Borrow) => {
    const statusConfig: Record<
      Borrow["status"],
      { variant: any; label: string; className?: string }
    > = {
      open: {
        variant: "default",
        label: "Active",
        className: "bg-green-100 text-green-800 hover:bg-green-100",
      },
      close: {
        variant: "outline",
        label: "Closed",
        className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      },
    };
    return (
      <Badge
        variant={statusConfig[borrow.status]?.variant || "secondary"}
        className={statusConfig[borrow.status]?.className}
      >
        {statusConfig[borrow.status]?.label || borrow.status}
      </Badge>
    );
  };

  const getDetailStatusBadge = (status: "borrowed" | "returned" | "lost") => {
    const config: Record<typeof status, { className: string }> = {
      borrowed: { className: "bg-orange-100 text-orange-800" },
      returned: { className: "bg-green-100 text-green-800" },
      lost: { className: "bg-red-100 text-red-800" },
    };
    return (
      <Badge variant="outline" className={`text-xs ${config[status]?.className ?? ""}`}>
        {status}
      </Badge>
    );
  };

  const canReturn = (borrow: Borrow) =>
    borrow.status === "open";

  const borrowsSkeleton = (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const requestsSkeleton = (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-36 w-full rounded-xl" />
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Library</h1>
        <p className="text-sm text-muted-foreground">
          Manage your borrows and borrow requests
        </p>
      </div>

      <Tabs defaultValue="borrows">
        <TabsList className="mb-4">
          <TabsTrigger value="borrows" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            My Borrows
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            My Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="borrows" className="space-y-4">
          {loadingBorrows ? (
            borrowsSkeleton
          ) : borrows.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-16 w-16" />}
              title="No Borrows Yet"
              description="You don't have any borrow history yet. Request a borrow through the library admin."
            />
          ) : (
            <div className="grid gap-4">
              {borrows.map((borrow) => (
                <Card key={borrow.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-semibold">
                          Borrow #{borrow.id}
                        </span>
                        {getStatusBadge(borrow)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(borrow.borrow_date).toLocaleDateString("id-ID")}
                        </span>
                        <span className="flex items-center gap-1 text-destructive">
                          <Calendar className="h-3 w-3" />
                          Return:{" "}
                          {new Date(borrow.return_date).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {borrow.borrow_code && (
                        <Link href={`/my-borrows/${borrow.borrow_code}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            Details
                          </Button>
                        </Link>
                      )}
                      {canReturn(borrow) && (
                        <Button
                          variant="submit"
                          size="sm"
                          onClick={() => setReturnDialog({ open: true, borrow })}
                          className="flex items-center gap-2"
                        >
                          <PackageX className="h-4 w-4" />
                          Request Return
                        </Button>
                      )}
                      {canReturn(borrow) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setReportLostDialog({ open: true, borrow })}
                          className="flex items-center gap-2"
                        >
                          <AlertCircle className="h-4 w-4" />
                          Report Loss
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-2">
                    <div className="text-sm font-medium text-muted-foreground mb-3">
                      Borrowed Books ({borrow.borrow_details.length}):
                    </div>
                    <div className="grid gap-2">
                      {borrow.borrow_details.map((detail) => (
                        <div
                          key={detail.id}
                          className="flex items-start gap-3 border rounded-lg p-3 bg-muted/20"
                        >
                          <BookOpen className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {detail.book_copy.book.title}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <p className="text-xs text-muted-foreground">
                                    Code:{" "}
                                    <span className="font-mono">
                                      {detail.book_copy.copy_code}
                                    </span>
                                  </p>
                                  {getDetailStatusBadge(detail.status)}
                                </div>
                              </div>
                            </div>
                            {detail.note && (
                              <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                                <span className="font-medium">Note: </span>
                                {detail.note}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {loadingRequests ? (
            requestsSkeleton
          ) : requests.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="h-16 w-16" />}
              title="Belum ada permintaan"
              description="Kamu belum mengajukan permintaan peminjaman. Cari buku dan klik 'Add to Request' untuk mulai."
            />
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <Card key={req.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <p className="font-mono font-semibold text-base">
                        {req.request_code}
                      </p>
                      <Badge
                        variant="secondary"
                        className="text-violet-700 bg-violet-100 hover:bg-violet-100 w-fit"
                      >
                        Menunggu diproses
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {format(new Date(req.borrow_date), "dd MMM yyyy")} &rarr;{" "}
                          {format(new Date(req.return_date), "dd MMM yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>{req.borrow_request_details?.length ?? 0} buku</span>
                      </div>
                    </div>

                    {req.borrow_request_details &&
                      req.borrow_request_details.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {req.borrow_request_details.map((d) => (
                            <span
                              key={d.id}
                              className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                            >
                              <BookOpen className="h-3 w-3" />
                              {d.book?.title ?? `Book #${d.book_id}`}
                            </span>
                          ))}
                        </div>
                      )}

                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setQrDialog(req)}
                      >
                        <QrCode className="h-3.5 w-3.5 mr-1" />
                        Lihat QR
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteRequest(req.id)}
                        disabled={deletingId === req.id}
                      >
                        {deletingId === req.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                        )}
                        Batalkan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ReturnDialog
        open={returnDialog.open}
        onOpenChange={(open) =>
          setReturnDialog({ open, borrow: open ? returnDialog.borrow : null })
        }
        borrow={returnDialog.borrow}
        onSuccess={fetchBorrows}
      />

      <ReportLostDialog
        open={reportLostDialog.open}
        onOpenChange={(open) =>
          setReportLostDialog({
            open,
            borrow: open ? reportLostDialog.borrow : null,
          })
        }
        borrow={reportLostDialog.borrow}
        onSuccess={fetchBorrows}
      />

      <Dialog open={!!qrDialog} onOpenChange={() => setQrDialog(null)}>
        <DialogContent className="max-w-xs text-center">
          <DialogHeader>
            <DialogTitle>QR Code Permintaan</DialogTitle>
            <DialogDescription>
              Tunjukkan QR ini kepada petugas perpustakaan
            </DialogDescription>
          </DialogHeader>
          {qrDialog?.qr_code_url ? (
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-lg border p-3 bg-white">
                <img
                  src={qrDialog.qr_code_url}
                  alt={qrDialog.request_code}
                  className="w-56 h-56 object-contain"
                />
              </div>
              <Badge variant="outline" className="font-mono">
                {qrDialog.request_code}
              </Badge>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
              <QrCode className="h-12 w-12 opacity-40" />
              <p className="text-sm">QR belum tersedia</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
