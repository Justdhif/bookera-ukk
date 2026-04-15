"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import { useRouter, useParams } from "next/navigation";
import { borrowService } from "@/services/borrow.service";
import { fineService } from "@/services/fine.service";
import { Borrow } from "@/types/borrow";
import { FineType } from "@/types/fine";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { BorrowQrCard } from "./BorrowQrCard";
import { BorrowInfoCard } from "./BorrowInfoCard";
import { BorrowBooksCard } from "./BorrowBooksCard";
import { BorrowFinesCard } from "./BorrowFinesCard";
import DataLoading from "@/components/custom-ui/DataLoading";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function BorrowDetailClient() {
  const t = useTranslations("borrow");
  const router = useRouter();
  const params = useParams();
  const borrowCode = params.borrowCode as string;
  const [borrow, setBorrow] = useState<Borrow | null>(null);
  const [loading, setLoading] = useState(true);
  const [fineTypes, setFineTypes] = useState<FineType[]>([]);
  const [returnStates, setReturnStates] = useState<
    Record<
      number,
      {
        status: "returned" | "lost";
        condition: "good" | "damaged";
        lostDate?: Date | undefined;
        notes?: string | undefined;
      }
    >
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    fetchBorrow();
    fetchFineTypes();
  }, [borrowCode]);

  const fetchFineTypes = async () => {
    try {
      const res = await fineService.getAllFineTypes();
      setFineTypes(res.data.data.data);
    } catch (error) {
      console.error("Failed to fetch fine types:", error);
    }
  };

  const fetchBorrow = async () => {
    try {
      setLoading(true);
      const res = await borrowService.getByCode(borrowCode, true);
      const borrowData = res.data.data;
      setBorrow(borrowData);

      const returnDetails =
        borrowData.book_returns?.flatMap(
          (bookReturn: any) => bookReturn.details ?? [],
        ) ?? [];
      const lostDetails =
        borrowData.lost_books?.flatMap(
          (lostBook: any) => lostBook.details ?? [],
        ) ?? [];

      const initialStates: Record<
        number,
        {
          status: "returned" | "lost";
          condition: "good" | "damaged";
          lostDate?: Date | undefined;
          notes?: string | undefined;
        }
      > = {};
      borrowData.borrow_details.forEach((detail: any) => {
        let condition: "good" | "damaged" = "good";
        const returnDetail = returnDetails.find(
          (rd: any) => rd.book_copy_id === detail.book_copy_id,
        );
        const lostDetail = lostDetails.find(
          (ld: any) => ld.book_copy_id === detail.book_copy_id,
        );

        if (returnDetail) {
          condition = returnDetail.condition === "damaged" ? "damaged" : "good";
        }

        initialStates[detail.id] = {
          status: detail.status === "lost" ? "lost" : "returned",
          condition: condition,
          lostDate: lostDetail?.lost_date ? new Date(lostDetail.lost_date) : undefined,
          notes: lostDetail?.notes ?? detail.note ?? undefined,
        };
      });
      setReturnStates(initialStates);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("loadError"));
      router.push("/admin/borrows");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReturnState = (
    detailId: number,
    state: Partial<{
      status: "returned" | "lost";
      condition: "good" | "damaged";
      lostDate: Date | undefined;
      notes: string | undefined;
    }>,
  ) => {
    setReturnStates((prev) => ({
      ...prev,
      [detailId]: { ...prev[detailId], ...state },
    }));
  };

  const handleSubmit = async () => {
    if (!borrow) return;

    const lostItemWithoutDate = Object.values(returnStates).some(
      (state) => state.status === "lost" && !state.lostDate,
    );

    if (lostItemWithoutDate) {
      toast.error(t("lostDateRequired"));
      return;
    }

    const items = Object.entries(returnStates).map(([id, state]) => ({
      borrow_detail_id: parseInt(id),
      status: state.status,
      condition: state.status === "returned" ? state.condition : null,
      lost_date:
        state.status === "lost" && state.lostDate
          ? format(state.lostDate, "yyyy-MM-dd")
          : undefined,
      notes:
        state.status === "lost"
          ? state.notes?.trim() || undefined
          : undefined,
    }));

    if (items.length === 0) {
      toast.error(t("noBooksSelected"));
      return;
    }

    try {
      setIsSubmitting(true);
      await borrowService.requestReturn(borrow.id, { items });
      toast.success(t("processReturnLossSuccess"));
      fetchBorrow();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("processReturnLossError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!borrow) return;

    try {
      setIsCompleting(true);
      await borrowService.complete(borrow.id);
      toast.success(t("completeSuccess"));
      fetchBorrow();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("completeError"));
    } finally {
      setIsCompleting(false);
    }
  };

  const isAllFinesPaid = borrow?.fines?.every(
    (f) => f.status === "paid" || f.status === "waived"
  );

  const returnDetails =
    borrow?.book_returns?.flatMap((bookReturn: any) => bookReturn.details ?? []) ?? [];
  const lostDetails =
    borrow?.lost_books?.flatMap((lostBook: any) => lostBook.details ?? []) ?? [];

  const isAllBooksProcessed = borrow?.borrow_details?.every((detail) => {
    const returnDetail = returnDetails.find(
      (rd: any) => rd.book_copy_id === detail.book_copy_id,
    );
    const lostDetail = lostDetails.find(
      (ld: any) => ld.book_copy_id === detail.book_copy_id,
    );

    return Boolean(returnDetail || lostDetail);
  });

  const hasAssignedCopies = (borrow?.borrow_details?.length ?? 0) > 0;

  const canComplete =
    borrow?.status === "open" &&
    hasAssignedCopies &&
    isAllBooksProcessed &&
    (isAllFinesPaid ?? true);

  return (
    <div className="space-y-6">
      <ContentHeader
        title={t("detailTitle")}
        description={t("detailDescription")}
        showBackButton
        isAdmin
      />

      {loading ? (
        <DataLoading size="lg" />
      ) : !borrow ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground italic">
          {t("noBorrowFound")}
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid gap-6 lg:grid-cols-3">
            <BorrowQrCard borrow={borrow} />
            <BorrowInfoCard borrow={borrow} />
          </div>

          <BorrowBooksCard
            borrow={borrow}
            returnStates={returnStates}
            onUpdateReturnState={handleUpdateReturnState}
            fineTypes={fineTypes}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />

          {borrow.fines && borrow.fines.length > 0 && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <BorrowFinesCard fines={borrow.fines} onUpdate={fetchBorrow} />
            </div>
          )}

          {canComplete && (
            <Card className="border-primary/20 bg-primary/5 dark:bg-primary/10 shadow-xl overflow-hidden relative animate-in zoom-in-95 duration-500">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <CheckCircle2 className="h-32 w-32 text-primary" />
              </div>
              <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative">
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-3xl font-black text-primary flex items-center justify-center md:justify-start gap-3 tracking-tighter uppercase">
                    <div className="p-2 bg-primary/20 rounded-xl">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                    {t("readyToCompleteTitle")}
                  </h3>
                  <p className="text-muted-foreground font-medium text-lg max-w-md">
                    {t("readyToCompleteDesc")}
                  </p>
                </div>
                <Button
                  size="lg"
                  className="h-16 px-10 text-xl font-black gap-4 shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all group"
                  variant="brand"
                  onClick={handleComplete}
                  disabled={isCompleting}
                >
                  {isCompleting ? (
                    <Loader2 className="h-7 w-7 animate-spin" />
                  ) : (
                    <>
                      {t("completeBorrowBtn")}
                      <ArrowRight className="h-7 w-7 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {borrow.status === "close" && (
            <Card className="border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-sm border-2 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <CheckCircle2 className="h-32 w-32 text-emerald-500" />
              </div>
              <CardContent className="p-10 flex flex-col items-center justify-center text-center space-y-6 relative">
                <div className="p-5 bg-background dark:bg-slate-900 rounded-3xl shadow-2xl text-emerald-500 border border-emerald-500/20 animate-in zoom-in-50 duration-700">
                  <CheckCircle2 className="h-16 w-16" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-4xl font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">
                    {t("borrowFinishedTitle")}
                  </h3>
                  <p className="text-muted-foreground font-medium text-xl italic max-w-2xl">
                    {t("borrowFinishedDesc", { date: new Date(borrow.updated_at).toLocaleString() })}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      )}
    </div>
  );
}
