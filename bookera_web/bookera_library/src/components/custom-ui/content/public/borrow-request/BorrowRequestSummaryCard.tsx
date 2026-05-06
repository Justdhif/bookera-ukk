import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { ClipboardList, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeUp } from "@/components/custom-ui/motion";

interface BorrowRequestSummaryCardProps {
  totalSelectedBooks: number;
  totalQuantity: number;
  borrowDate: Date | undefined;
  returnDate: Date | undefined;
  loading: boolean;
  loadingBooks: boolean;
  isSubmitDisabled: boolean;
  hasOutOfStockBook: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export function BorrowRequestSummaryCard({
  totalSelectedBooks,
  totalQuantity,
  borrowDate,
  returnDate,
  loading,
  loadingBooks,
  isSubmitDisabled,
  hasOutOfStockBook,
  onSubmit,
  onCancel,
}: BorrowRequestSummaryCardProps) {
  const t = useTranslations("public");
  const tCommon = useTranslations("common");

  return (
    <FadeUp>
      <Card className="border-2 border-border bg-linear-to-br from-background via-background to-primary/5">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            {tCommon("summary")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {tCommon("booksSelected")}
              </span>
              <span className="font-bold">{totalSelectedBooks}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {tCommon("totalCopies")}
              </span>
              <span className="font-bold">{totalQuantity}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t("borrowDateLabel")}
              </span>
              <span className="font-bold text-xs">
                {borrowDate ? format(borrowDate, "dd MMM yyyy") : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t("returnDateLabel")}
              </span>
              <span className="font-bold text-xs">
                {returnDate ? format(returnDate, "dd MMM yyyy") : "-"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 p-3 border border-amber-500/20 text-amber-700 dark:text-amber-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold">{t("lateReturnWarning")}</p>
              <p className="text-[11px] leading-relaxed opacity-90">
                {t("lateReturnDesc")}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3 w-full">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 h-12 rounded-xl"
            >
              {t("detail.editDialog.cancel")}
            </Button>

            <Button
              onClick={onSubmit}
              disabled={isSubmitDisabled}
              loading={loading || loadingBooks}
              variant="submit"
              className="flex-1 h-12 text-base gap-2 rounded-xl shadow-lg"
            >
              {loading ? (
                t("processingBtn")
              ) : loadingBooks ? (
                tCommon("loading")
              ) : hasOutOfStockBook ? (
                t("outOfStock")
              ) : (
                <>{t("submitRequest")}</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </FadeUp>
  );
}
