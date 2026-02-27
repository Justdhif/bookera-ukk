import { useState } from "react";
import { BookReturn } from "@/types/book-return";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

interface ReturnRejectDialogProps {
  open: boolean;
  bookReturn: BookReturn | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
}

export function ReturnRejectDialog({
  open,
  bookReturn,
  onOpenChange,
  onConfirm,
}: ReturnRejectDialogProps) {
  const t = useTranslations('common');
  const [rejectionReason, setRejectionReason] = useState("");

  const handleConfirm = () => {
    onConfirm(rejectionReason);
    setRejectionReason("");
  };

  const handleCancel = () => {
    onOpenChange(false);
    setRejectionReason("");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('rejectReturn')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('rejectReturnDescription')} #{bookReturn?.id} {t('from')}{" "}
            {bookReturn?.loan?.user?.email}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label htmlFor="rejection-reason">{t('rejectReasonOptional')}</Label>
          <Textarea
            id="rejection-reason"
            placeholder={t('rejectReturnReason')}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t('rejectReturn')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
