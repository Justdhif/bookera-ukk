"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ReportLostConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  bookTitle?: string;
  borrowCode?: string;
}

export default function ReportLostConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  bookTitle,
  borrowCode,
}: ReportLostConfirmDialogProps) {
  const t = useTranslations("public");
  const tCommon = useTranslations("common");
  const [isReporting, setIsReporting] = useState(false);

  const handleConfirm = async () => {
    setIsReporting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Report lost error:", error);
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-0 shadow-2xl">
        <DialogHeader className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-500" />
            </div>
          </div>

          <div className="text-center space-y-3">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t("reportLostBookTitle")}
            </DialogTitle>

            {(bookTitle || borrowCode) && (
              <div className="rounded-lg bg-muted/60 px-3 py-2 text-sm space-y-0.5 text-left">
                {bookTitle && (
                  <p className="font-medium text-foreground truncate">
                    {bookTitle}
                  </p>
                )}
                {borrowCode && (
                  <p className="text-xs text-muted-foreground">
                    {t("borrowCodeLabel")}: {borrowCode}
                  </p>
                )}
              </div>
            )}

            <DialogDescription className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("reportLostConfirmDesc")}
            </DialogDescription>
          </div>

          <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 dark:border-amber-800/40 bg-amber-50/80 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>{tCommon("lostBookWarningText")}</p>
          </div>
        </DialogHeader>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-2 mt-2">
          <Button
            type="button"
            variant="brand"
            onClick={() => onOpenChange(false)}
            disabled={isReporting}
            className="w-full sm:w-auto sm:flex-1 h-11 font-medium border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-all duration-200"
          >
            {tCommon("cancel")}
          </Button>
          <Button
            type="button"
            variant="brand"
            onClick={handleConfirm}
            disabled={isReporting}
            className="w-full sm:w-auto sm:flex-1 h-11 font-medium shadow-sm transition-all duration-200"
          >
            {isReporting ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("reportingBtn")}
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <AlertTriangle className="mr-2 h-4 w-4" />
                {t("reportLostConfirmBtn")}
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
