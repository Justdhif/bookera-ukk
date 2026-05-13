"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { StaggerContainer } from "@/components/custom-ui/motion/StaggerContainer";
import { ScaleIn } from "@/components/custom-ui/motion/ScaleIn";
import { FadeUp } from "@/components/custom-ui/motion/FadeUp";

interface DiscardConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

export default function DiscardConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
}: DiscardConfirmDialogProps) {
  const t = useTranslations("common");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-0 shadow-2xl">
        <StaggerContainer>
          <ScaleIn>
            <DialogHeader className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {title || t("discardChangesTitle")}
                </DialogTitle>
                <DialogDescription className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  {description || t("discardChangesDesc")}
                </DialogDescription>
              </div>
            </DialogHeader>
          </ScaleIn>

          <FadeUp>
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto sm:flex-1 h-11 font-medium border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-all duration-200"
              >
                {cancelText || t("cancel")}
              </Button>
              <Button
                type="button"
                variant="submit"
                onClick={() => {
                  onConfirm();
                  onOpenChange(false);
                }}
                className="w-full sm:w-auto sm:flex-1 h-11 font-medium bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700 shadow-sm transition-all duration-200 text-white"
              >
                {confirmText || t("discard")}
              </Button>
            </DialogFooter>
          </FadeUp>
        </StaggerContainer>
      </DialogContent>
    </Dialog>
  );
}
