"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { borrowService } from "@/services/borrow.service";
import { Borrow } from "@/types/borrow";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  PackageCheck,
  QrCode,
  AlertCircle,
  PackageX,
  DollarSign,
  RotateCcw,
} from "lucide-react";
import { QrCodeImage } from "@/components/custom-ui/QrCodeImage";
import { format } from "date-fns";
import { ReturnDialog } from "./ReturnDialog";
import { ReportLostDialog } from "./ReportLostDialog";

export default function PublicBorrowDetailClient() {
  const router = useRouter();
  const params = useParams();
  const borrowCode = params.borrowCode as string;

  const [borrow, setBorrow] = useState<Borrow | null>(null);
  const [loading, setLoading] = useState(true);
  const [returnDialog, setReturnDialog] = useState<{ open: boolean; borrow: Borrow | null }>({
    open: false,
    borrow: null,
  });
  const [reportLostDialog, setReportLostDialog] = useState<{ open: boolean; borrow: Borrow | null }>({
    open: false,
    borrow: null,
  });

  useEffect(() => {
    fetchBorrow();
  }, [borrowCode]);

  const fetchBorrow = async () => {
    try {
      setLoading(true);
      const res = await borrowService.showByCode(borrowCode);
      setBorrow(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load borrow details");
      router.push("/my-borrows");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Borrow["status"]) => {
    const config: Record<Borrow["status"], { label: string; className: string }> = {
      open: { label: "Active", className: "bg-green-100 text-green-800 hover:bg-green-100" },
      close: { label: "Closed", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
    };
    return (
      <Badge className={config[status]?.className}>
        <PackageCheck className="h-3 w-3 mr-1" />
        {config[status]?.label || status}
      </Badge>
    );
  };

  const canReturn = (b: Borrow) => b.status === "open";

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-72" />
          <Skeleton className="lg:col-span-2 h-72" />
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!borrow) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/my-borrows")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Borrow Detail</h1>
            <p className="text-muted-foreground text-sm">
              Details for your borrow record
            </p>
          </div>
        </div>
        {canReturn(borrow) && (
          <div className="flex gap-2">
            <Button
              variant="submit"
              size="sm"
              onClick={() => setReturnDialog({ open: true, borrow })}
              className="flex items-center gap-2"
            >
              <PackageX className="h-4 w-4" />
              Request Return
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setReportLostDialog({ open: true, borrow })}
              className="flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              Report Loss
            </Button>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* QR Code + Status Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Your Borrow
            </CardTitle>
            <CardDescription>Borrow code &amp; status</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 flex-1 justify-center">
            <QrCodeImage
              url={borrow.qr_code_url}
              code={borrow.borrow_code}
              label="Borrow Code"
              size="md"
            />

            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
                <p className="text-sm font-medium">Status</p>
                {getStatusBadge(borrow.status)}
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Dates & Info Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Borrow Information</CardTitle>
            <CardDescription>Dates and borrow details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dates */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Dates
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3 bg-muted/20">
                  <p className="text-sm text-muted-foreground">Borrow Date</p>
                  <p className="font-medium">
                    {format(new Date(borrow.borrow_date), "dd MMM yyyy")}
                  </p>
                </div>
                <div className="rounded-lg border p-3 bg-muted/20">
                  <p className="text-sm text-muted-foreground">Return Date</p>
                  <p className="font-medium text-destructive">
                    {format(new Date(borrow.return_date), "dd MMM yyyy")}
                  </p>
                </div>
              </div>
            </div>

            {/* Fines */}
            {borrow.fines && borrow.fines.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Fines ({borrow.fines.length})
                </h3>
                <div className="grid gap-2">
                  {borrow.fines.map((fine: any) => (
                    <div
                      key={fine.id}
                      className="flex items-center justify-between rounded-lg border p-3 bg-muted/20"
                    >
                      <div>
                        <p className="text-sm font-medium">{fine.fine_type?.name || "Fine"}</p>
                        <p className="text-xs text-muted-foreground">{fine.description || ""}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          Rp {Number(fine.amount || 0).toLocaleString("id-ID")}
                        </p>
                        <Badge
                          variant={fine.status === "paid" ? "default" : "secondary"}
                          className={
                            fine.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }
                        >
                          {fine.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Returns */}
            {borrow.book_returns && borrow.book_returns.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Return Records ({borrow.book_returns.length})
                </h3>
                <div className="grid gap-2">
                  {borrow.book_returns.map((ret: any) => (
                    <div
                      key={ret.id}
                      className="rounded-lg border p-3 bg-muted/20 flex items-center justify-between"
                    >
                      <p className="text-sm font-medium">Return #{ret.id}</p>
                      <div className="flex items-center gap-2">
                        {ret.return_date && (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(ret.return_date), "dd MMM yyyy")}
                          </p>
                        )}
                        <Badge variant="secondary">{ret.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Borrowed Books */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Borrowed Books ({borrow.borrow_details?.length || 0})
          </CardTitle>
          <CardDescription>Books included in this borrow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {borrow.borrow_details?.map((detail) => {
              return (
                <div
                  key={detail.id}
                  className="flex items-start gap-3 rounded-lg border bg-card p-4"
                >
                  <BookOpen className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {detail.book_copy?.book?.title || "Unknown"}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <p className="text-xs text-muted-foreground">
                            Code:{" "}
                            <span className="font-mono">{detail.book_copy?.copy_code}</span>
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {detail.status}
                          </Badge>
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
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ReturnDialog
        open={returnDialog.open}
        onOpenChange={(open) =>
          setReturnDialog({ open, borrow: open ? returnDialog.borrow : null })
        }
        borrow={returnDialog.borrow}
        onSuccess={fetchBorrow}
      />
      <ReportLostDialog
        open={reportLostDialog.open}
        onOpenChange={(open) =>
          setReportLostDialog({ open, borrow: open ? reportLostDialog.borrow : null })
        }
        borrow={reportLostDialog.borrow}
        onSuccess={fetchBorrow}
      />
    </div>
  );
}
