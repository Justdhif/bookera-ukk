"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { borrowService } from "@/services/borrow.service";
import { Borrow } from "@/types/borrow";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle, PackageX } from "lucide-react";
import { ReturnDialog } from "../ReturnDialog";
import { ReportLostDialog } from "../ReportLostDialog";
import { BorrowDetailSkeleton } from "./BorrowDetailSkeleton";
import { BorrowQrCard } from "./BorrowQrCard";
import { BorrowInfoCard } from "./BorrowInfoCard";
import { BorrowBooksCard } from "./BorrowBooksCard";

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

  const canReturn = borrow?.status === "open";

  if (loading) return <BorrowDetailSkeleton />;
  if (!borrow) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
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
            <p className="text-muted-foreground text-sm">Details for your borrow record</p>
          </div>
        </div>
        {canReturn && (
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

      <div className="grid gap-6 lg:grid-cols-3">
        <BorrowQrCard borrow={borrow} />
        <BorrowInfoCard borrow={borrow} />
      </div>

      <BorrowBooksCard borrow={borrow} />

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

