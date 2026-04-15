"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Borrow } from "@/types/borrow";
import { borrowService } from "@/services/borrow.service";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  AlertTriangle,
  BookOpen,
  CalendarClock,
  Hash,
  CheckCircle2,
} from "lucide-react";

interface ReportLostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  borrow: Borrow | null;
  onSuccess?: () => void;
}

export function ReportLostDialog({
  open,
  onOpenChange,
  borrow,
  onSuccess,
}: ReportLostDialogProps) {
  const t = useTranslations("public");
  const [selectedDetailIds, setSelectedDetailIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCheckedChange = (detailId: number, checked: boolean) => {
    setSelectedDetailIds((prev) =>
      checked ? [...prev, detailId] : prev.filter((id) => id !== detailId),
    );
  };

  const borrowedDetails = borrow?.borrow_details?.filter(
    (d) => d.status === "borrowed",
  ) || [];

  const handleClose = () => {
    setSelectedDetailIds([]);
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!borrow || selectedDetailIds.length === 0) return;
    setLoading(true);
    try {
      await borrowService.reportLost(borrow.id, {
        borrow_detail_ids: selectedDetailIds,
      });
      toast.success(t("lossReportSuccess"));
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || t("lossReportError"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col p-0 gap-0"
      >
        <SheetHeader className="px-6 py-5 border-b bg-destructive/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/15 border border-destructive/20">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-destructive">
                {t("reportLostBookTitle")}
              </SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("reportLostWarning")}
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="rounded-xl border bg-muted/30 p-4 space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {t("borrowInfoTitle")}
              </p>
              <div className="flex items-center gap-2.5 text-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                  <Hash className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-muted-foreground">{t("borrowCodeLabel")}:</span>
                <span className="font-bold font-mono text-foreground">
                  {" "}{borrow?.borrow_code || (borrow?.id ? `#${borrow.id}` : "—")}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10">
                  <CalendarClock className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <span className="text-muted-foreground">{t("dueLabel")}:</span>
                <span className="font-bold text-foreground">
                  {" "}{borrow?.return_date
                    ? format(new Date(borrow.return_date), "dd MMM yyyy")
                    : "—"}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-bold">
                    {t("selectLostBooksLabel")}
                  </Label>
                </div>
                {(borrowedDetails?.length ?? 0) > 0 && (
                  <Badge
                    variant={selectedDetailIds.length > 0 ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {t("selectedCount", { count: selectedDetailIds.length, total: borrowedDetails.length || 0 })}
                  </Badge>
                )}
              </div>

              {borrowedDetails?.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-10 text-center">
                  <BookOpen className="h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground font-medium">
                    {t("noBooksAvailableReport")}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {borrowedDetails?.map((detail) => {
                    const isSelected = selectedDetailIds.includes(detail.id);
                    return (
                      <div
                        key={detail.id}
                        className="rounded-xl border-2 overflow-hidden transition-all duration-200"
                        style={{
                          borderColor: isSelected
                            ? "hsl(var(--destructive) / 0.5)"
                            : "hsl(var(--border))",
                        }}
                      >
                        <div
                          className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-destructive/5"
                              : "hover:bg-muted/40"
                          }`}
                          onClick={() =>
                            handleCheckedChange(detail.id, !isSelected)
                          }
                        >
                          <Checkbox
                            id={`lost-${detail.id}`}
                            checked={isSelected}
                            onCheckedChange={(c) =>
                              handleCheckedChange(detail.id, c as boolean)
                            }
                            className="shrink-0 data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm leading-snug line-clamp-2">
                              {detail.book_copy?.book?.title || t("public.noTitle")}
                            </p>
                            <Badge
                              variant="outline"
                              className="mt-1.5 text-xs font-mono"
                            >
                              {detail.book_copy.copy_code}
                            </Badge>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="h-5 w-5 text-destructive shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <Separator />
          </div>
        </div>

        <SheetFooter className="p-4 border-t bg-muted/10 flex-row gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="flex-1"
          >
            {t("detail.editDialog.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || selectedDetailIds.length === 0}
            loading={loading}
            variant="submit"
            className="flex-1 text-white gap-2 font-bold bg-destructive hover:bg-destructive/90"
          >
            {!loading && <AlertTriangle className="h-4 w-4" />}
            {loading
              ? t("submitting")
              : selectedDetailIds.length > 0
              ? t("reportCount", { count: selectedDetailIds.length })
              : t("reportLostBook")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
