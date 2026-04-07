"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
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
import { useAuthStore } from "@/store/auth.store";

export default function PublicBorrowDetailClient() {
  const t = useTranslations("public");
  const router = useRouter();
  const params = useParams();
  const borrowCode = params.borrowCode as string;
  const userSlug = useAuthStore((state) => state.user?.slug);
  const [borrow, setBorrow] = useState<Borrow | null>(null);
  const [loading, setLoading] = useState(true);
  const [returnDialog, setReturnDialog] = useState<{
    open: boolean;
    borrow: Borrow | null;
  }>({
    open: false,
    borrow: null,
  });
  const [reportLostDialog, setReportLostDialog] = useState<{
    open: boolean;
    borrow: Borrow | null;
  }>({
    open: false,
    borrow: null,
  });

  useEffect(() => {
    fetchBorrow();
  }, [borrowCode]);

  const fetchBorrow = async () => {
    try {
      setLoading(true);
      const res = await borrowService.getByCode(borrowCode);
      setBorrow(res.data.data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load borrow details",
      );
      router.push(userSlug ? `/${userSlug}/my-borrows` : "/my-borrows");
    } finally {
      setLoading(false);
    }
  };

  const canReturn = borrow?.status === "open";

  if (loading) return <BorrowDetailSkeleton />;
  if (!borrow) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <ContentHeader
        title="Borrow Detail"
        description="Details for your borrow record"
        showBackButton
        rightActions={
          canReturn && (
            <div className="flex gap-2">
              <Button
                variant="submit"
                size="sm"
                onClick={() => setReturnDialog({ open: true, borrow })}
                className="flex items-center gap-2"
              >
                <PackageX className="h-4 w-4" />
                {t("requestReturn")}
              </Button>
              <Button
                variant="brand"
                size="sm"
                onClick={() => setReportLostDialog({ open: true, borrow })}
                className="flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Report Loss
              </Button>
            </div>
          )
        }
      />

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
          setReportLostDialog({
            open,
            borrow: open ? reportLostDialog.borrow : null,
          })
        }
        borrow={reportLostDialog.borrow}
        onSuccess={fetchBorrow}
      />
    </div>
  );
}
