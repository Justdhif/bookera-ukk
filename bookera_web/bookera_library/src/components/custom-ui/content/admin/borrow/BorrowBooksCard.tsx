"use client";

import { Borrow } from "@/types/borrow";
import { FineType } from "@/types/fine";
import Image from "next/image";
import BorrowDetailStatusBadge from "@/components/custom-ui/badge/BorrowDetailStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface BorrowBooksCardProps {
  borrow: Borrow;
  returnStates: Record<
    number,
    {
      status: "returned" | "lost";
      condition: "good" | "damaged";
      fineTypeId?: number;
      lostDate?: Date | undefined;
      notes?: string | undefined;
    }
  >;
  onUpdateReturnState: (
    detailId: number,
    state: Partial<{
      status: "returned" | "lost";
      condition: "good" | "damaged";
      fineTypeId?: number;
      lostDate: Date | undefined;
      notes: string | undefined;
    }>,
  ) => void;
  fineTypes: FineType[];
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function BorrowBooksCard({
  borrow,
  returnStates,
  onUpdateReturnState,
  fineTypes,
  onSubmit,
  isSubmitting,
}: BorrowBooksCardProps) {
  const t = useTranslations("borrow");
  const tCommon = useTranslations("common");

  const sortFineTypesByValue = (types: FineType[]) =>
    [...types].sort(
      (a, b) => getFineTypeSortValue(a) - getFineTypeSortValue(b) || a.id - b.id,
    );

  const getFineTypeSortValue = (fineType: FineType) =>
    Number(
      fineType.type === "damaged"
        ? fineType.percentage ?? 0
        : fineType.amount ?? 0,
    );

  const formatFineTypeValue = (fineType: FineType) => {
    if (fineType.type === "damaged") {
      return `${new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 2,
      }).format(Number(fineType.percentage ?? 0))}%`;
    }

    return `Rp ${Number(fineType.amount ?? 0).toLocaleString("id-ID")}`;
  };

  const getFineTypesByType = (type: FineType["type"]) =>
    sortFineTypesByValue(
      fineTypes.filter((fineType) => fineType.type === type),
    );

  const damagedFineTypes = getFineTypesByType("damaged");
  const lateFineType = getFineTypesByType("late")[0];
  const lostFineType = getFineTypesByType("lost")[0];

  const hasAssignedCopies = (borrow.borrow_details?.length ?? 0) > 0;
  const requestedBooks = borrow.borrow_request?.borrow_request_details ?? [];
  const showRequested = !hasAssignedCopies && requestedBooks.length > 0;
  const bookCount = hasAssignedCopies
    ? borrow.borrow_details.length
    : requestedBooks.length;

  const daysLate = (() => {
    if (!borrow.return_date) return 0;

    const expected = new Date(borrow.return_date);
    expected.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (today <= expected) return 0;

    return Math.ceil(
      (today.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24),
    );
  })();

  const lateFineAmount = Number(lateFineType?.amount ?? 0);
  const totalLateFine = daysLate * lateFineAmount;

  const returnDetails =
    borrow.book_returns?.flatMap(
      (bookReturn: any) => bookReturn.details ?? [],
    ) ?? [];
  const lostDetails =
    borrow.lost_books?.flatMap((lostBook: any) => lostBook.details ?? []) ?? [];
  const hasEditableDetails = borrow.borrow_details.some((detail) => {
    const returnDetail = returnDetails.find(
      (returnItem: any) => returnItem.book_copy_id === detail.book_copy_id,
    );
    const lostDetail = lostDetails.find(
      (lostItem: any) => lostItem.book_copy_id === detail.book_copy_id,
    );

    return !returnDetail && !lostDetail;
  });
  const canProcess = borrow.status === "open" && hasEditableDetails;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm">
      <CardHeader className="border-b border-border/60">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-5 w-5 text-primary" />
              {showRequested ? t("requestedBooks") : t("borrowedBooks")} (
              {bookCount})
            </CardTitle>
            <CardDescription className="max-w-2xl">
              {showRequested
                ? t("requestedBooksDesc")
                : t("manageReturnStatus")}
            </CardDescription>
          </div>

          {canProcess && (
            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="gap-2 shadow-sm"
              variant="submit"
              loading={isSubmitting}
            >
              {t("confirmReturns")}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-border/60">
          {hasAssignedCopies &&
            borrow.borrow_details.map((detail) => {
              const returnDetail = returnDetails.find(
                (returnItem: any) =>
                  returnItem.book_copy_id === detail.book_copy_id,
              );
              const lostDetail = lostDetails.find(
                (lostItem: any) =>
                  lostItem.book_copy_id === detail.book_copy_id,
              );
              const isProcessed = Boolean(returnDetail || lostDetail);
              const canEditStatus = borrow.status === "open" && !isProcessed;
              const state = returnStates[detail.id];
              const selectedDamagedFineType =
                damagedFineTypes.find(
                  (fineType) => fineType.id === state?.fineTypeId,
                ) ?? damagedFineTypes[0];
              const selectedDamagedFineTypeId =
                state?.fineTypeId ?? damagedFineTypes[0]?.id ?? undefined;
              const book = detail.book_copy?.book;
              const bookPrice = Number(book?.price ?? 0);
              const authors =
                book?.authors?.map((author) => author.name).join(", ") ||
                book?.author ||
                tCommon("noAuthors");
              const publisher =
                book?.publishers?.[0]?.name ||
                book?.publisher ||
                tCommon("noData");
              const categories = book?.categories ?? [];

              return (
                <div
                  key={detail.id}
                  className={`p-6 lg:p-8 transition-colors ${
                    !isProcessed ? "hover:bg-muted/30" : "bg-muted/20"
                  }`}
                >
                  <div className="space-y-6">
                    <div className="flex flex-col gap-5 sm:flex-row">
                      <div className="relative shrink-0 group">
                        <div className="relative h-36 w-24 overflow-hidden rounded-2xl border border-primary/20 bg-muted shadow-md">
                          <Image
                            src={book?.cover_image || "/placeholder-book.png"}
                            alt={book?.title || tCommon("bookCover")}
                            fill
                            sizes="96px"
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                        <Badge className="absolute -right-3 top-3 border-2 border-background bg-background px-2.5 py-0.5 font-semibold text-foreground shadow-md">
                          #{detail.book_copy?.copy_code}
                        </Badge>
                      </div>

                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="space-y-1">
                          <h4 className="line-clamp-2 text-xl font-black leading-tight text-foreground">
                            {book?.title || tCommon("noData")}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="font-medium text-muted-foreground">
                              {tCommon("from")}
                            </span>
                            <span className="font-semibold text-foreground underline decoration-primary/30 decoration-2 underline-offset-4">
                              {authors}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="italic text-muted-foreground">
                              {publisher}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                          <BorrowDetailStatusBadge status={detail.status} />
                          {categories.slice(0, 2).map((category: any) => (
                            <Badge
                              key={category.id}
                              variant="secondary"
                              className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
                            >
                              {category.name}
                            </Badge>
                          ))}
                        </div>

                        {detail.note && (
                          <div className="flex max-w-xl items-start gap-2.5 rounded-2xl border border-destructive/20 bg-destructive/5 p-3.5 text-sm text-destructive">
                            <Info className="mt-0.5 h-4 w-4 shrink-0" />
                            <p className="font-medium leading-relaxed">
                              <span className="font-semibold">
                                {tCommon("note")}:
                              </span>{" "}
                              {detail.note}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {canEditStatus ? (
                      <div className="rounded-3xl border border-border/60 bg-muted/20 p-4 sm:p-5 shadow-sm">
                        <div className="space-y-5">
                          <div className="space-y-3">
                            <Label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                              {t("returnStatus")}
                            </Label>
                            <RadioGroup
                              value={state?.status}
                              onValueChange={(val: "returned" | "lost") =>
                                onUpdateReturnState(detail.id, {
                                  status: val,
                                  condition:
                                    val === "returned"
                                      ? (state?.condition ?? "good")
                                      : undefined,
                                  fineTypeId:
                                    val === "returned" &&
                                    (state?.condition ?? "good") === "damaged"
                                      ? (state?.fineTypeId ??
                                        damagedFineTypes[0]?.id)
                                      : undefined,
                                  lostDate:
                                    val === "lost"
                                      ? state?.lostDate
                                      : undefined,
                                  notes:
                                    val === "lost" ? state?.notes : undefined,
                                })
                              }
                              className="grid gap-3 sm:grid-cols-2"
                            >
                              <Label
                                htmlFor={`status-returned-${detail.id}`}
                                className="flex cursor-pointer items-center gap-3 py-1"
                              >
                                <RadioGroupItem
                                  value="returned"
                                  id={`status-returned-${detail.id}`}
                                  className="shrink-0"
                                />
                                <span className="font-medium text-foreground">
                                  {tCommon("returned")}
                                </span>
                              </Label>

                              <Label
                                htmlFor={`status-lost-${detail.id}`}
                                className="flex cursor-pointer items-center gap-3 py-1"
                              >
                                <RadioGroupItem
                                  value="lost"
                                  id={`status-lost-${detail.id}`}
                                  className="shrink-0"
                                />
                                <span className="font-medium text-foreground">
                                  {tCommon("lost")}
                                </span>
                              </Label>
                            </RadioGroup>
                          </div>

                          {state?.status === "returned" ? (
                            <div className="space-y-5">
                              <div className="space-y-3">
                                <Label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                                  {t("bookCondition")}
                                </Label>
                                <RadioGroup
                                  value={state?.condition}
                                  onValueChange={(val: "good" | "damaged") =>
                                    onUpdateReturnState(detail.id, {
                                      condition: val,
                                      fineTypeId:
                                        val === "damaged"
                                          ? (state?.fineTypeId ??
                                            damagedFineTypes[0]?.id)
                                          : undefined,
                                    })
                                  }
                                  className="grid gap-3 sm:grid-cols-2"
                                >
                                  <Label
                                    htmlFor={`condition-good-${detail.id}`}
                                    className="flex cursor-pointer items-center gap-3 py-1"
                                  >
                                    <RadioGroupItem
                                      value="good"
                                      id={`condition-good-${detail.id}`}
                                      className="shrink-0"
                                    />
                                    <span className="font-medium text-foreground">
                                      {t("conditionGood")}
                                    </span>
                                  </Label>

                                  <Label
                                    htmlFor={`condition-damaged-${detail.id}`}
                                    className="flex cursor-pointer items-center gap-3 py-1"
                                  >
                                    <RadioGroupItem
                                      value="damaged"
                                      id={`condition-damaged-${detail.id}`}
                                      className="shrink-0"
                                    />
                                    <span className="font-medium text-foreground">
                                      {t("conditionDamaged")}
                                    </span>
                                  </Label>
                                </RadioGroup>
                              </div>

                              {state?.condition === "damaged" && (
                                <div className="space-y-3">
                                  <Label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                                    {t("fineTypeLabel")}
                                  </Label>

                                  {damagedFineTypes.length > 0 ? (
                                    <RadioGroup
                                      value={
                                        selectedDamagedFineType
                                          ? String(selectedDamagedFineType.id)
                                          : ""
                                      }
                                      onValueChange={(value) =>
                                        onUpdateReturnState(detail.id, {
                                          fineTypeId: Number(value),
                                        })
                                      }
                                      className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
                                    >
                                      {damagedFineTypes.map((fineType) => (
                                        <Label
                                          key={fineType.id}
                                          htmlFor={`fine-type-${detail.id}-${fineType.id}`}
                                          className="flex cursor-pointer items-start gap-3 py-1"
                                        >
                                          <RadioGroupItem
                                            value={String(fineType.id)}
                                            id={`fine-type-${detail.id}-${fineType.id}`}
                                            className="mt-1 shrink-0"
                                          />
                                          <div className="min-w-0 space-y-1">
                                            <div className="flex items-start justify-between gap-3">
                                              <p className="font-semibold leading-tight">
                                                {fineType.name}
                                              </p>
                                              <span className="shrink-0 text-sm font-black text-amber-600">
                                                {formatFineTypeValue(fineType)}
                                              </span>
                                            </div>
                                            {fineType.description && (
                                              <p className="text-xs leading-relaxed text-muted-foreground">
                                                {fineType.description}
                                              </p>
                                            )}
                                          </div>
                                        </Label>
                                      ))}
                                    </RadioGroup>
                                  ) : (
                                    <div className="rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted-foreground">
                                      {t("noFineTypesAvailable")}
                                    </div>
                                  )}

                                  {selectedDamagedFineType && (
                                    <div className="space-y-2 border-t border-border/50 pt-3">
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600">
                                            {t("fineInfo")}
                                          </p>
                                          <p className="font-semibold text-foreground">
                                            {selectedDamagedFineType.name}
                                          </p>
                                        </div>
                                        <span className="text-lg font-black text-amber-600">
                                          {formatFineTypeValue(
                                            selectedDamagedFineType,
                                          )}
                                        </span>
                                      </div>
                                      {selectedDamagedFineType.description && (
                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                          {selectedDamagedFineType.description}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : state?.status === "lost" ? (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                                  {t("lostDateLabel")}
                                </Label>
                                <DatePicker
                                  value={state?.lostDate}
                                  onChange={(date) =>
                                    onUpdateReturnState(detail.id, {
                                      lostDate: date,
                                    })
                                  }
                                  placeholder={t("lostDatePlaceholder")}
                                  dateMode="past"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                                  {t("lostNoteLabel")}
                                </Label>
                                <Textarea
                                  value={state?.notes ?? ""}
                                  onChange={(event) =>
                                    onUpdateReturnState(detail.id, {
                                      notes: event.target.value,
                                    })
                                  }
                                  rows={3}
                                  placeholder={t("lostNotePlaceholder")}
                                  className="resize-none"
                                />
                              </div>

                              <div className="space-y-2 border-t border-border/50 pt-3">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-600">
                                      {lostFineType?.name ?? t("lostFineInfo")}
                                    </p>
                                    <p className="font-semibold text-foreground">
                                      {t("lostFineValueNote")}
                                    </p>
                                  </div>
                                  <span className="text-lg font-black text-rose-600">
                                    {formatCurrency(bookPrice)}
                                  </span>
                                </div>
                                {lostFineType?.description && (
                                  <p className="text-sm leading-relaxed text-muted-foreground">
                                    {lostFineType.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : null}

                          {daysLate > 0 && state?.status !== "lost" && (
                            <div className="space-y-2 border-t border-border/50 pt-3">
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                  <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-rose-600">
                                    <Clock className="h-4 w-4" />
                                    {lateFineType?.name ??
                                      t("lateFineInfo", { days: daysLate })}
                                  </p>
                                  <p className="font-semibold text-foreground">
                                    {t("lateFineInfo", { days: daysLate })}
                                  </p>
                                </div>
                                <span className="text-lg font-black text-rose-600">
                                  {formatCurrency(totalLateFine)}
                                </span>
                              </div>
                              {lateFineType?.description && (
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                  {lateFineType.description}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full items-center rounded-3xl border border-border/60 bg-background/80 px-4 py-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          <div className="space-y-0.5">
                            <p className="font-semibold text-foreground">
                              {t("processedAs", {
                                status: tCommon(
                                  detail.status === "borrowed"
                                    ? "borrowed"
                                    : detail.status,
                                ),
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {tCommon(
                                detail.status === "borrowed"
                                  ? "borrowed"
                                  : detail.status,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          {showRequested &&
            requestedBooks.map((detail) => (
              <div
                key={detail.id}
                className="mx-6 my-3 flex items-start gap-3 rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
              >
                <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-sm font-medium">
                    {detail.book?.title || tCommon("noData")}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{t("pendingCopyAssignment")}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
