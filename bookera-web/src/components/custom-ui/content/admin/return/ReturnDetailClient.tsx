"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

import { bookReturnService } from "@/services/book-return.service";
import { BookReturn } from "@/types/book-return";
import { Fine } from "@/types/fine";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ReturnDetailSkeleton } from "./return-detail/ReturnDetailSkeleton";
import { ReturnInfoCard } from "./return-detail/ReturnInfoCard";
import { ReturnBooksCard } from "./return-detail/ReturnBooksCard";
import { ReturnFinesCard } from "./return-detail/ReturnFinesCard";
import { ReturnActionsCard } from "./return-detail/ReturnActionsCard";

export default function ReturnDetailClient() {
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
        error.response?.data?.message || "Failed to load return details",
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
      toast.success("Book conditions saved successfully");
      fetchDetail();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to save book conditions",
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
      toast.success("All fines marked as paid");
      fetchDetail();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to finish fines");
    } finally {
      setFinishingFines(false);
    }
  };

  const handleFinishBorrow = async () => {
    if (!bookReturn) return;
    setFinishingBorrow(true);
    try {
      await bookReturnService.approve(bookReturn.id);
      toast.success("Borrow closed successfully");
      router.push("/admin/returns");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to close borrow");
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
      <div className="flex items-center gap-4">
        <Button
          variant="brand"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Return Detail</h1>
          <p className="text-muted-foreground">
            Complete information about this return — Borrow #
            {bookReturn.borrow_id}
          </p>
        </div>
      </div>

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
