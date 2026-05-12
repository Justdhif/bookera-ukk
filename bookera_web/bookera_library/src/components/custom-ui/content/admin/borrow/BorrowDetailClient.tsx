"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ContentHeader from "@/components/custom-ui/content/ContentHeader";
import DataLoading from "@/components/custom-ui/DataLoading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { borrowService } from "@/services/borrow.service";
import { fineTypeService } from "@/services/fine-type.service";
import { Borrow } from "@/types/borrow";
import { FineType } from "@/types/fine";
import { BorrowBooksCard } from "./BorrowBooksCard";
import { BorrowFinesCard } from "./BorrowFinesCard";
import { BorrowInfoCard } from "./BorrowInfoCard";
import { BorrowQrCard } from "./BorrowQrCard";
import { StaggerContainer, FadeUp, SlideIn } from "@/components/custom-ui/motion";

interface BorrowReturnItemState {
  status: "returned" | "lost";
  condition: "good" | "damaged";
  fineTypeId?: number;
  lostDate?: Date | undefined;
  notes?: string | undefined;
}

type BorrowReturnStates = Record<number, BorrowReturnItemState>;

function buildInitialReturnStates(
  borrowData: Borrow,
  fineTypes: FineType[],
): BorrowReturnStates {
  const damagedFines =
    borrowData.fines?.filter((fine: any) => fine.fine_type?.type === "damaged") ?? [];
  const returnRecords = borrowData.book_returns ?? [];
  const lostRecords = borrowData.lost_books ?? [];

  const initialStates: BorrowReturnStates = {};

  borrowData.borrow_details.forEach((detail: any) => {
    let condition: "good" | "damaged" = "good";
    const returnDetail = returnRecords.find(
      (returnItem: any) => returnItem.book_copy_id === detail.book_copy_id,
    );
    const lostDetail = lostRecords.find(
      (lostItem: any) => lostItem.book_copy_id === detail.book_copy_id,
    );

    if (lostDetail) {
      condition = "good";
    }

    if (returnDetail) {
      condition = returnDetail.condition === "damaged" ? "damaged" : "good";
    }

    const damagedFine = damagedFines.find((fine: any) => {
      const copyCode = detail.book_copy?.copy_code;
      return Boolean(copyCode && fine.notes?.includes(copyCode));
    });

    const fallbackDamagedFineTypeId =
      fineTypes
        .filter((fineType) => fineType.type === "damaged")
        .sort((left, right) => left.amount - right.amount || left.id - right.id)[0]?.id ??
      undefined;

    initialStates[detail.id] = {
      status: lostDetail || detail.status === "lost" ? "lost" : "returned",
      condition,
      fineTypeId:
        condition === "damaged"
          ? damagedFine?.fine_type_id ?? damagedFine?.fine_type?.id ?? fallbackDamagedFineTypeId
          : undefined,
      lostDate: lostDetail?.lost_date ? new Date(lostDetail.lost_date) : undefined,
      notes: lostDetail?.notes ?? detail.note ?? undefined,
    };
  });

  return initialStates;
}

export default function BorrowDetailClient() {
  const t = useTranslations("borrow");
  const router = useRouter();
  const params = useParams();
  const borrowCode = params.borrowCode as string;

  const [borrow, setBorrow] = useState<Borrow | null>(null);
  const [loading, setLoading] = useState(true);
  const [fineTypes, setFineTypes] = useState<FineType[]>([]);
  const [returnStates, setReturnStates] = useState<BorrowReturnStates>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const fetchFineTypes = async (): Promise<FineType[]> => {
    try {
      const res = await fineTypeService.getAll({ per_page: 1000 });
      return res.data.data.data ?? [];
    } catch (error) {
      console.error("Failed to fetch fine types:", error);
      return [];
    }
  };

  const fetchBorrow = async (nextFineTypes: FineType[] = fineTypes) => {
    try {
      setLoading(true);
      const res = await borrowService.getByCode(borrowCode, true);
      const borrowData = res.data.data;
      setBorrow(borrowData);
      setReturnStates(buildInitialReturnStates(borrowData, nextFineTypes));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("loadError"));
      router.push("/admin/borrows");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      const nextFineTypes = await fetchFineTypes();
      setFineTypes(nextFineTypes);
      await fetchBorrow(nextFineTypes);
    };

    void load();
  }, [borrowCode]);

  const handleUpdateReturnState = (
    detailId: number,
    state: Partial<BorrowReturnItemState>,
  ) => {
    setReturnStates((previous) => ({
      ...previous,
      [detailId]: { ...previous[detailId], ...state },
    }));
  };

  const handleSubmit = async () => {
    if (!borrow) return;



    const defaultDamagedFineTypeId =
      fineTypes
        .filter((fineType) => fineType.type === "damaged")
        .sort((left, right) => left.amount - right.amount || left.id - right.id)[0]?.id ??
      undefined;

    const items = Object.entries(returnStates).map(([id, state]) => ({
      borrow_detail_id: Number(id),
      status: state.status,
      condition: state.status === "returned" ? state.condition : null,
      fine_type_id:
        state.status === "returned" && state.condition === "damaged"
          ? state.fineTypeId ?? defaultDamagedFineTypeId
          : undefined,
      lost_date:
        state.status === "lost" && state.lostDate
          ? format(state.lostDate, "yyyy-MM-dd")
          : undefined,
      notes: state.status === "lost" ? state.notes?.trim() || undefined : undefined,
    }));

    if (items.length === 0) {
      toast.error(t("noBooksSelected"));
      return;
    }

    try {
      setIsSubmitting(true);
      await borrowService.confirmReturn(borrow.id, { items });
      toast.success(t("processReturnLossSuccess"));
      await fetchBorrow(fineTypes);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("processReturnLossError"));
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
      await fetchBorrow(fineTypes);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("completeError"));
    } finally {
      setIsCompleting(false);
    }
  };

  const isAllFinesPaid = borrow?.fines?.every(
    (fine) => fine.status === "paid" || fine.status === "waived",
  );

  const returnRecords = borrow?.book_returns ?? [];
  const lostRecords = borrow?.lost_books ?? [];

  const isAllBooksProcessed = borrow?.borrow_details?.every((detail) => {
    const returnDetail = returnRecords.find(
      (returnItem: any) => returnItem.book_copy_id === detail.book_copy_id,
    );
    const lostDetail = lostRecords.find(
      (lostItem: any) => lostItem.book_copy_id === detail.book_copy_id,
    );

    return Boolean(returnDetail || lostDetail);
  });

  const hasAssignedCopies = (borrow?.borrow_details?.length ?? 0) > 0;
  const canComplete =
    borrow?.status === "open" &&
    hasAssignedCopies &&
    isAllBooksProcessed &&
    (isAllFinesPaid ?? true);

  const closedDescription = borrow
    ? t("borrowFinishedDesc", {
        date: new Date(borrow.updated_at).toLocaleString(),
      })
    : "";

  return (
    <StaggerContainer className="space-y-6">
      <FadeUp>
        <ContentHeader
          title={t("detailTitle")}
          description={t("detailDescription")}
          showBackButton
          isAdmin
        />
      </FadeUp>

      {loading ? (
        <DataLoading size="lg" />
      ) : !borrow ? (
        <div className="flex flex-col items-center justify-center min-h-100 text-muted-foreground italic bg-muted/30 rounded-3xl border-2 border-dashed">
          {t("noBorrowFound")}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Sticky Sidebar */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-2">
            <FadeUp delay={0.1}>
              <BorrowQrCard borrow={borrow} />
            </FadeUp>
            <FadeUp delay={0.15}>
              <BorrowInfoCard borrow={borrow} />
            </FadeUp>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-2 lg:self-start">
            <FadeUp delay={0.2}>
              <BorrowBooksCard
                borrow={borrow}
                returnStates={returnStates}
                onUpdateReturnState={handleUpdateReturnState}
                fineTypes={fineTypes}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </FadeUp>

            {borrow.fines && borrow.fines.length > 0 && (
              <FadeUp delay={0.25}>
                <BorrowFinesCard fines={borrow.fines} onUpdate={() => fetchBorrow(fineTypes)} />
              </FadeUp>
            )}

            {canComplete && (
              <SlideIn direction="up" distance={30} delay={0.3}>
                <Card className="border-primary/20 bg-primary/5 dark:bg-primary/10 shadow-xl overflow-hidden relative">
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
              </SlideIn>
            )}

            {borrow.status === "close" && (
              <FadeUp delay={0.3}>
                <Card className="border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-sm border-2 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <CheckCircle2 className="h-32 w-32 text-emerald-500" />
                  </div>
                  <CardContent className="p-10 flex flex-col items-center justify-center text-center space-y-6 relative">
                    <div className="p-5 bg-background dark:bg-slate-900 rounded-3xl shadow-2xl text-emerald-500 border border-emerald-500/20">
                      <CheckCircle2 className="h-16 w-16" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-4xl font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">
                        {t("borrowFinishedTitle")}
                      </h3>
                      <p className="text-muted-foreground font-medium text-xl italic max-w-2xl">
                        {closedDescription}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </FadeUp>
            )}
          </div>
        </div>
      )}
    </StaggerContainer>
  );
}
