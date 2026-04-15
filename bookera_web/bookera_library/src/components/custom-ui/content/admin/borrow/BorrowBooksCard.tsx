"use client";

import { Borrow } from "@/types/borrow";
import { FineType } from "@/types/fine";
import { Badge } from "@/components/ui/badge";
import BorrowDetailStatusBadge from "@/components/custom-ui/badge/BorrowDetailStatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Clock, Loader2, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";

interface BorrowBooksCardProps {
  borrow: Borrow;
  returnStates: Record<
    number,
    {
      status: "returned" | "lost";
      condition: "good" | "damaged";
      lostDate?: Date | undefined;
      notes?: string | undefined;
    }
  >;
  onUpdateReturnState: (
    detailId: number,
    state: Partial<{
      status: "returned" | "lost";
      condition: "good" | "damaged";
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

  const getFineAmount = (type: "lost" | "damaged") => {
    return fineTypes.find((ft) => ft.type === type)?.amount || 0;
  };

  const hasAssignedCopies = (borrow.borrow_details?.length ?? 0) > 0;
  const requestedBooks = borrow.borrow_request?.borrow_request_details ?? [];
  const showRequested = !hasAssignedCopies && requestedBooks.length > 0;
  const bookCount = hasAssignedCopies
    ? borrow.borrow_details.length
    : requestedBooks.length;

  const returnDetails =
    borrow.book_returns?.flatMap((bookReturn: any) => bookReturn.details ?? []) ?? [];
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
    <Card className="shadow-lg border-2">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-6 w-6 text-primary" />
              {showRequested ? t("requestedBooks") : t("borrowedBooks")} ({bookCount})
            </CardTitle>
            <CardDescription>
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
              variant="brand"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {t("confirmReturns")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {hasAssignedCopies &&
            borrow.borrow_details.map((detail) => {
              const returnDetail = returnDetails.find(
                (returnItem: any) => returnItem.book_copy_id === detail.book_copy_id,
              );
              const lostDetail = lostDetails.find(
                (lostItem: any) => lostItem.book_copy_id === detail.book_copy_id,
              );
              const isProcessed = Boolean(returnDetail || lostDetail);
              const canEditStatus = borrow.status === "open" && !isProcessed;
              
              const state = returnStates[detail.id];
              const damagedFine = getFineAmount("damaged");
              const lostFine = getFineAmount("lost");

              return (
                <div
                  key={detail.id}
                    className={`p-6 transition-colors ${
                    !isProcessed ? "hover:bg-muted/5" : "bg-muted/10 opacity-75"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    <div className="flex-1 flex gap-5">
                      <div className="relative group shrink-0">
                        <div className="w-24 h-36 rounded-xl overflow-hidden shadow-lg border border-primary/20 bg-muted">
                          <img
                            src={detail.book_copy?.book?.cover_image || "/placeholder-book.png"}
                            alt={detail.book_copy?.book?.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => (e.currentTarget.src = "https://picsum.photos/seed/book/200/300")}
                          />
                        </div>
                        <Badge className="absolute -top-2 -right-2 shadow-md px-2 py-0.5 bg-background text-foreground border-2">
                          #{detail.book_copy?.copy_code}
                        </Badge>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="space-y-1">
                          <h4 className="font-black text-xl leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {detail.book_copy?.book?.title || "Unknown"}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="text-muted-foreground font-medium">{tCommon("from")}</span>
                            <span className="text-foreground font-bold underline decoration-primary/30 decoration-2 underline-offset-4">
                              {detail.book_copy?.book?.author || tCommon("noAuthors")}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground italic">
                              {detail.book_copy?.book?.publisher || "Standard Edition"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <BorrowDetailStatusBadge status={detail.status} />
                          {detail.book_copy?.book?.categories && detail.book_copy.book.categories.length > 0 && (
                            <div className="flex gap-1.5 overflow-hidden">
                              {detail.book_copy.book.categories.slice(0, 2).map((cat: any) => (
                                <Badge key={cat.id} variant="secondary" className="text-[10px] uppercase font-bold tracking-tight py-0">
                                  {cat.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {detail.note && (
                          <div className="flex items-start gap-2.5 text-xs text-destructive bg-destructive/5 p-3 rounded-xl border border-destructive/20 max-w-sm">
                            <Info className="h-4 w-4 shrink-0 mt-0.5" />
                            <p className="font-semibold italic leading-relaxed">
                              {tCommon("note")}: {detail.note}
                            </p>
                          </div>
                        )}

                        {canEditStatus && state?.status === "returned" && state?.condition === "damaged" && (
                          <div className="flex items-center gap-2 p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-500/20 max-w-sm animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <div className="text-sm">
                              <span className="font-semibold uppercase text-[10px] tracking-wider block mb-0.5">{t("fineInfo")}</span>
                              <span className="font-black text-lg">{formatCurrency(damagedFine || 0)}</span>
                            </div>
                          </div>
                        )}

                        {canEditStatus && state?.status === "lost" && (
                          <div className="flex items-center gap-2 p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-500/20 max-w-sm animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <div className="text-sm">
                              <span className="font-semibold uppercase text-[10px] tracking-wider block mb-0.5">{t("lostFineInfo")}</span>
                              <span className="font-black text-lg">{formatCurrency(lostFine || 0)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {canEditStatus && (
                      <div className="flex-1 max-w-md space-y-6 bg-muted/20 p-4 rounded-xl border border-muted-foreground/10">
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            {t("returnStatus")}
                          </Label>
                          <RadioGroup
                            value={state?.status}
                              onValueChange={(val: "returned" | "lost") =>
                                onUpdateReturnState(detail.id, {
                                  status: val,
                                  condition:
                                    val === "returned"
                                      ? state?.condition ?? "good"
                                      : undefined,
                                  lostDate:
                                    val === "lost" ? state?.lostDate : undefined,
                                  notes:
                                    val === "lost" ? state?.notes : undefined,
                                })
                              }
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2 bg-background p-2 px-4 rounded-lg border cursor-pointer hover:border-primary transition-colors has-checked:border-primary has-checked:bg-primary/5">
                              <RadioGroupItem value="returned" id={`r-${detail.id}`} />
                              <Label htmlFor={`r-${detail.id}`} className="cursor-pointer font-medium">{tCommon("returned")}</Label>
                            </div>
                            <div className="flex items-center space-x-2 bg-background p-2 px-4 rounded-lg border cursor-pointer hover:border-destructive transition-colors has-checked:border-destructive has-checked:bg-destructive/5">
                              <RadioGroupItem value="lost" id={`l-${detail.id}`} />
                              <Label htmlFor={`l-${detail.id}`} className="cursor-pointer font-medium">{tCommon("lost")}</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {state?.status === "returned" ? (
                          <div className="space-y-3 ml-1 pl-4 border-l-2 border-primary/20">
                            <Label className="text-sm font-semibold text-muted-foreground">{t("bookCondition")}</Label>
                            <RadioGroup
                              value={state?.condition}
                              onValueChange={(val: "good" | "damaged") =>
                                onUpdateReturnState(detail.id, { condition: val })
                              }
                              className="flex gap-4"
                            >
                              <div className="flex items-center space-x-2 cursor-pointer">
                                <RadioGroupItem value="good" id={`c-g-${detail.id}`} />
                                <Label htmlFor={`c-g-${detail.id}`} className="cursor-pointer">{t("conditionGood")}</Label>
                              </div>
                              <div className="flex items-center space-x-2 cursor-pointer">
                                <RadioGroupItem value="damaged" id={`c-d-${detail.id}`} />
                                <Label htmlFor={`c-d-${detail.id}`} className="cursor-pointer">{t("conditionDamaged")}</Label>
                              </div>
                            </RadioGroup>


                          </div>
                        ) : state?.status === "lost" ? (
                          <div className="space-y-4 ml-1 pl-4 border-l-2 border-red-200 animate-in fade-in slide-in-from-top-1">
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-muted-foreground">
                                {t("lostDateLabel")}
                              </Label>
                              <DatePicker
                                value={state?.lostDate}
                                onChange={(date) =>
                                  onUpdateReturnState(detail.id, { lostDate: date })
                                }
                                placeholder={t("lostDatePlaceholder")}
                                dateMode="past"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-muted-foreground">
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


                          </div>
                        ) : null}
                      </div>
                    )}

                    {!canEditStatus && (
                      <div className="flex flex-col items-center justify-center p-4 min-w-[200px] text-muted-foreground italic">
                        <div className="flex items-center gap-2 font-medium">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          {t("processedAs", { status: tCommon(detail.status === "borrowed" ? "borrowed" : detail.status) })}
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
                className="flex items-start gap-3 rounded-lg border bg-card p-4 mx-6 my-3 hover:shadow-md transition-shadow"
              >
                <BookOpen className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-medium text-sm truncate">
                    {detail.book?.title || "Unknown"}
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
