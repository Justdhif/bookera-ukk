"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface BorrowRequestRejectDialogProps {
  open: boolean;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onReject: (rejectReason?: string) => Promise<void>;
}

export default function BorrowRequestRejectDialog({
  open,
  loading,
  onOpenChange,
  onReject,
}: BorrowRequestRejectDialogProps) {
  const t = useTranslations("borrow-request");
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (!open) {
      setRejectReason("");
    }
  }, [open]);

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setRejectReason("");
    }
  };

  const handleReject = async () => {
    try {
      await onReject(rejectReason.trim() || undefined);
      handleClose(false);
    } catch {
      // Parent already handles the toast; keep the dialog open.
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            {t("rejectRequest")}
          </DialogTitle>
          <DialogDescription>{t("rejectDialogDesc")}</DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder={t("rejectReasonPlaceholder")}
          value={rejectReason}
          onChange={(event) => setRejectReason(event.target.value)}
          rows={3}
        />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={loading}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="submit"
            onClick={handleReject}
            disabled={loading}
            loading={loading}
            className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600/20 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {!loading && <XCircle className="h-4 w-4" />}
            {t("rejectRequest")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
