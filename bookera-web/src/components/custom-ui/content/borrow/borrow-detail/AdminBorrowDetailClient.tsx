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
  User,
  DollarSign,
  RotateCcw,
} from "lucide-react";
import { QrCodeImage } from "@/components/custom-ui/QrCodeImage";
import { format } from "date-fns";

export default function AdminBorrowDetailClient() {
  const router = useRouter();
  const params = useParams();
  const borrowCode = params.borrowCode as string;

  const [borrow, setBorrow] = useState<Borrow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBorrow();
  }, [borrowCode]);

  const fetchBorrow = async () => {
    try {
      setLoading(true);
      const res = await borrowService.showAdminByCode(borrowCode);
      setBorrow(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load borrow details");
      router.push("/admin/borrows");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Borrow["status"]) => {
    const config: Record<Borrow["status"], { label: string; className: string }> = {
      open: { label: "Open", className: "bg-green-100 text-green-800 hover:bg-green-100" },
      close: { label: "Closed", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
    };
    return (
      <Badge className={config[status]?.className}>
        <PackageCheck className="h-3 w-3 mr-1" />
        {config[status]?.label || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80" />
          <Skeleton className="lg:col-span-2 h-80" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!borrow) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/borrows")}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Borrow Detail</h1>
          <p className="text-muted-foreground">Complete information about this borrow</p>
        </div>
      </div>

      {/* Summary + QR Code */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* QR Code Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Borrow QR Code
            </CardTitle>
            <CardDescription>Scan to identify this borrow</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 flex-1 justify-center">
            <QrCodeImage
              url={borrow.qr_code_url}
              code={borrow.borrow_code}
              label="Borrow Code"
              size="lg"
            />

            {/* Status badges */}
            <div className="flex flex-col gap-2 items-center w-full">
              <div className="flex items-center justify-between w-full rounded-lg border p-3 bg-muted/30">
                <div>
                  <p className="text-sm font-medium">Borrow Status</p>
                  <p className="text-xs text-muted-foreground">Current processing state</p>
                </div>
                {getStatusBadge(borrow.status)}
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Borrow Information</CardTitle>
            <CardDescription>Complete details about this borrow record</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Borrower
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 rounded-lg border p-4 bg-muted/20">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{borrow.user?.profile?.full_name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{borrow.user?.email || "-"}</p>
                </div>
                {borrow.user?.profile?.identification_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">ID Number</p>
                    <p className="font-medium font-mono">
                      {borrow.user.profile.identification_number}
                    </p>
                  </div>
                )}
                {borrow.user?.profile?.phone_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{borrow.user.profile.phone_number}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Dates
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
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
                <div className="rounded-lg border p-3 bg-muted/20">
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-medium">
                    {format(new Date(borrow.created_at), "dd MMM yyyy")}
                  </p>
                </div>
              </div>
            </div>

            {/* Fines summary */}
            {borrow.fines && borrow.fines.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Fines ({borrow.fines.length})
                </h3>
                <div className="grid gap-2">
                  {borrow.fines.map((fine: any) => (
                    <div key={fine.id} className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
                      <div>
                        <p className="text-sm font-medium">{fine.fine_type?.name || "Fine"}</p>
                        <p className="text-xs text-muted-foreground">{fine.description || ""}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">Rp {Number(fine.amount || 0).toLocaleString("id-ID")}</p>
                        <Badge
                          variant={fine.status === "paid" ? "default" : "secondary"}
                          className={fine.status === "paid" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
                        >
                          {fine.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Returns summary */}
            {borrow.book_returns && borrow.book_returns.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Return Records ({borrow.book_returns.length})
                </h3>
                <div className="grid gap-2">
                  {borrow.book_returns.map((ret: any) => (
                    <div key={ret.id} className="rounded-lg border p-3 bg-muted/20 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Return #{ret.id}</p>
                        <Badge variant="secondary">{ret.status}</Badge>
                      </div>
                      {ret.return_date && (
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(ret.return_date), "dd MMM yyyy")}
                        </p>
                      )}
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
          <CardDescription>List of books included in this borrow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {borrow.borrow_details?.map((detail) => {
              return (
                <div
                  key={detail.id}
                  className="flex items-start gap-3 rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
                >
                  <BookOpen className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {detail.book_copy?.book?.title || "Unknown"}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-muted-foreground">
                            Copy Code:{" "}
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

    </div>
  );
}
