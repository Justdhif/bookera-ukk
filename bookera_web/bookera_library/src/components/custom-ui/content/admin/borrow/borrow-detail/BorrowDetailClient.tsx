"use client";

import { useEffect, useState } from "react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { useRouter, useParams } from "next/navigation";
import { borrowService } from "@/services/borrow.service";
import { Borrow } from "@/types/borrow";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { BorrowDetailSkeleton } from "./BorrowDetailSkeleton";
import { BorrowQrCard } from "./BorrowQrCard";
import { BorrowInfoCard } from "./BorrowInfoCard";
import { BorrowBooksCard } from "./BorrowBooksCard";
import { BorrowAssignCopiesCard } from "./BorrowAssignCopiesCard";

export default function BorrowDetailClient() {
  const t = useTranslations("borrow");
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
      const res = await borrowService.getByCode(borrowCode, true);
      setBorrow(res.data.data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("loadError"),
      );
      router.push("/admin/borrows");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <BorrowDetailSkeleton />;
  if (!borrow) return null;

  return (
    <div className="space-y-6">
      <ContentHeader
        title={t("detailTitle")}
        description={t("detailDescription")}
        showBackButton
        isAdmin
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <BorrowQrCard borrow={borrow} />
        <BorrowInfoCard borrow={borrow} />
      </div>

      <BorrowBooksCard borrow={borrow} />

      {borrow.borrow_request_id &&
        (!borrow.borrow_details || borrow.borrow_details.length === 0) && (
          <BorrowAssignCopiesCard borrow={borrow} onAssigned={fetchBorrow} />
        )}
    </div>
  );
}
