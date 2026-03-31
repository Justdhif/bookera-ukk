"use client";
import { useState, useEffect } from "react";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { useRouter, useParams } from "next/navigation";
import { bookReturnService } from "@/services/book-return.service";
import { BookReturn } from "@/types/book-return";
import { Fine } from "@/types/fine";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { ReturnDetailSkeleton } from "./return-detail/ReturnDetailSkeleton";
import { ReturnInfoCard } from "./return-detail/ReturnInfoCard";
import { ReturnBooksCard } from "./return-detail/ReturnBooksCard";
import { ReturnFinesCard } from "./return-detail/ReturnFinesCard";
import { ReturnActionsCard } from "./return-detail/ReturnActionsCard";

export default function ReturnDetailClient() {
  const t = useTranslations("return");
  const router = useRouter();
  const params = useParams();
  const returnId = Number(params.id);
  const [bookReturn, setBookReturn] = useState<BookReturn | null>(null);
  const [loading, setLoading] = useState(true);
  const [conditions, setConditions] = useState<
    Record<number, "good" | "damaged" | "lost">
  >({});
  const [savingConditions, setSavingConditions] = useState(false);
  const [finishingFines, setFinishingFines] = useState(false);
  const [finishingBorrow, setFinishingBorrow] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [returnId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await bookReturnService.getById(returnId);
      const data = res.data.data;
      setBookReturn(data);
      const initialConditions: Record<number, "good" | "damaged" | "lost"> = {};
      data.details?.forEach(
        (d: { id: number; condition: "good" | "damaged" | "lost" }) => {
          initialConditions[d.id] = d.condition;
        },
      );
      setConditions(initialConditions);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("loadError"),
      );
      router.push("/admin/returns");
    } finally {
      setLoading(false);
    }
  };

  const handleConditionChange = (
    detailId: number,
    condition: "good" | "damaged" | "lost",
  ) => {
    setConditions((prev) => ({ ...prev, [detailId]: condition }));
  };

  const handleSaveConditions = async () => {
    if (!bookReturn) return;
    setSavingConditions(true);
    try {
      await bookReturnService.updateConditions(bookReturn.id, conditions);
      toast.success(t("saveConditionsSuccess"));
      fetchDetail();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("saveConditionsError"),
      );
    } finally {
      setSavingConditions(false);
    }
  };

  const handleFinishFines = async () => {
    if (!bookReturn) return;
    setFinishingFines(true);
    try {
      await bookReturnService.finishFines(bookReturn.id);
      toast.success(t("finishFinesSuccess"));
      fetchDetail();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("finishFinesError"));
    } finally {
      setFinishingFines(false);
    }
  };

  const handleFinishBorrow = async () => {
    if (!bookReturn) return;
    setFinishingBorrow(true);
    try {
      await bookReturnService.approve(bookReturn.id);
      toast.success(t("closeBorrowSuccess"));
      router.push("/admin/returns");
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("closeBorrowError"));
    } finally {
      setFinishingBorrow(false);
    }
  };

  if (loading) return <ReturnDetailSkeleton />;
  if (!bookReturn) return null;

  const fines: Fine[] = bookReturn.borrow?.fines ?? [];
  const hasUnpaidFines = fines.some((f) => f.status === "unpaid");
  const borrowIsClosed = bookReturn.borrow?.status === "close";

  return (
    <div className="space-y-6">
      <ContentHeader
        title={t("detailTitle")}
        description={t("detailDescription", { id: bookReturn.borrow_id })}
        showBackButton
        isAdmin
      />
      <ReturnInfoCard bookReturn={bookReturn} />
      <ReturnBooksCard
        bookReturn={bookReturn}
        conditions={conditions}
        onConditionChange={handleConditionChange}
        onSaveConditions={handleSaveConditions}
        savingConditions={savingConditions}
        isLocked={borrowIsClosed}
      />
      <ReturnFinesCard fines={fines} />
      {!borrowIsClosed && (
        <ReturnActionsCard
          hasUnpaidFines={hasUnpaidFines}
          onFinishFines={handleFinishFines}
          finishingFines={finishingFines}
          onFinishBorrow={handleFinishBorrow}
          finishingBorrow={finishingBorrow}
        />
      )}
    </div>
  );
}
